# Calling C# Methods from C++
Alright, now that we've got an instance of a C# class, it's time to call some methods. It's important to note that Mono gives us two ways of calling C# methods: `mono_runtime_invoke` and Unmanaged Method Thunks. This section will only cover `mono_runtime_invoke`, but I will definitely cover Unmanaged Methods Thunks later. I will however go over the differences between the two in this section.

## `mono_runtime_invoke` vs. Unmanaged Method Thunks
So, what's the difference? Well the difference is mainly in *how* Mono actually ends up calling the method in question, and also *what* parameters you can pass in.
Using `mono_runtime_invoke` is slower compared to Unmanaged Method Thunks, but it's also *safe* and more flexible. `mono_runtime_invoke` can invoke *any* method with *any* parameters, and from what I understand `mono_runtime_invoke` also does a lot more error checking and validation on the object you pass, as well as the parameters.

Unmanaged Method Thunks are *technically* called "Unmanaged to Managed Thunks", but I call them "Unmanaged Method Thunks" because I accidentially misread the name once. Unmanaged Method Thunks is a concept added in version 2 of Mono, and they allow you to call C# methods with far less overhead compared to `mono_runtime_invoke`, this means that if you're calling a C# method many times a second, so maybe you have an `OnUpdate` method in C# that you're calling 60 - 144 times per second, you'd want to create an Unmanaged to Managed Thunk.

Effectivley Unmanaged to Managed Thunks create a custom invokation method (e.g a custom "trampoline") from unmanaged to managed code, and that invokation method is specific to the method signature you gave it, meaning there is no ambiguity as to what parameters can be passed in.

So, when should you use `mono_runtime_invoke` and when should you use Unmanaged Method Thunks? Well it depends. If you don't know the signature of the method at compile time (C++ compile time) then you have should probably use `mono_runtime_invoke`, although you *can* use Unmanaged Method Thunks as well, but generally for those you want the parameters to be known at compile time.

A general rule of thumb is that if you're calling a C# method several times (more than 10 I'd say) per second, and you know the signature of that method at compile time you should use Unmanaged Method Thunks.

If you don't know the method signature at compile time or if you're only calling the method every now and then instead of several times per second you probably want to go with `mono_runtime_invoke`.

## Retrieving and Invoking a C# Method
Alright, now that we understand the difference between `mono_runtime_invoke` and Unmanaged Method Thunks it's finally time to get a reference to the C# method we want to call.

There are a lot of different ways to get a reference to a C# method, and the method you'll use entirely depends on if you're parsing the C# assembly and you don't know what methods are going to be in there beforehand, and one for if you already know the method name and signature, as well as what class it belongs to, before you even load the assembly.

In this case we'll be using the manual way of getting references to methods, but we will cover the more dynamic way later on. Alright, with that out of the way it's time to take a look at the code.

### The Code
```cpp
MonoObject* InstantiateClass(const char* namespaceName, const char* className)
{
    // Get a reference to the class we want to instantiate
    MonoClass* testingClass = GetClassInAssembly(s_AppAssembly, namespaceName, className);

    // Allocate an instance of our class
    MonoObject* classInstance = mono_object_new(s_AppDomain, testingClass);

    if (classInstance == nullptr)
    {
        // Log error here and abort
    }

    // Call the parameterless (default) constructor
    mono_runtime_object_init(classInstance);
    
    return classInstance;
}

void CallPrintFloatVarMethod(MonoObject* objectInstance)
{
    // Get the MonoClass pointer from the instance
    MonoClass* instanceClass = mono_object_get_class(objectInstance);

    // Get a reference to the method in the class
    MonoMethod* method = mono_class_get_method_from_name(instanceClass, "PrintFloatVar", 0);

    if (method == nullptr)
    {
        // No method called "PrintFloatVar" with 0 parameters in the class, log error or something
        return;
    }

    // Call the C# method on the objectInstance instance, and get any potential exceptions
    MonoObject* exception = nullptr;
    mono_runtime_invoke(method, objectInstance, nullptr, &exception);

    // TODO: Handle the exception
}

// ...
MonoObject* testInstance = InstantiateClass("", "CSharpTesting");
CallPrintFloatVarMethod(testInstance);
```

### Explaining the Code
Alright, as you can see I've taken the code from the previous section and wrapped it in a function for convenience. But what we're interested in is the `CallPrintFloatVarMethod` function, which will call (or *invoke*) the `PrintFloatVar` on the instance of the `CSharpTesting` class. Remember that methods are stored inside classes, but you *invoke* them on an *instance* of that class. Essentially all C# methods have an implicit parameter that references the instance of the class that the method is being called on, which is effectively what let's us use the `this` keyword. Luckily we don't have to pass that as an explicit parameter in Mono, but it's good to properly understand how it works behind the scenes.

The first thing we do before calling the method is getting a `MonoClass` pointer *from* the class instance, we could also pass the class to the C++ function if we wanted to. We can get the class by calling `mono_object_get_class` and passing in the `MonoObject` pointer as the only parameter.

Next we actually need to get a reference to the C# method, or `MonoMethod`, and as with everything in Mono we get it as a pointer. The function we use to get the pointer is `mono_class_get_method_from_name`. *Yes I know, Mono can be very verbose...* The first parameter we need to pass is the class that the method belongs to, it's worth nothing that if the method doesn't actually exist in the class the function will return `nullptr`. The second parameter is the name of the method we want to get.

Lastly we need to tell Mono how many parameters the method has. If it doesn't have any we simply pass 0, or we could optionally pass -1 in which case Mono will simply return the first version of the method that it finds.

It's important to note that if there's multiple versions of the method that has the same number of parameters this function won't work properly, since it doesn't check the actual *signature* of the method, just that it has the correct number of parameters. There are ways to get methods by a specific signature though, we'll cover that later as well.

Alright, now that we've got a reference to the C# method we can actually invoke it, which as I explained in the first part of this article we can do by calling `mono_runtime_invoke`.

But before we call that you can see that I've declared a pointer to a `MonoObject` and called it `exception`, as well as assigned it to `nullptr`. Why? Well it's because if the method we call throws an exception our scripting engine would probably want to know about that so we can e.g log that exception to a console window or something along those lines.

If the method throws an exception `mono_runtime_invoke` will populate that `MonoObject` with the exception *instance*, which we can then use to get information about what went wrong.

So now that I've explained that, what are all the parameters of `mono_runtime_invoke`? The first parameter is simply the pointer to the C# method that we want to invoke. The second parameter is the class *instance* that we want to call the method on. The third parameter is a pointer to an array of any parameters we want to pass in, but since `PrintFloatVar` doesn't take any parameters we can simply pass `nullptr`.

And the last parameter is a pointer to the `MonoObject*` we declared on the previous line, it's the memory address of our `exception` variable. If you don't care about exceptions at this time you can just pass `nullptr` and Mono will ignore that parameter.

It's also worth noting that `mono_runtime_invoke` can actually return something to us. A `MonoObject*` in fact. This is useful if the method you're calling returns something and you want to retrieve and do something with that return value in C++. If the method is marked as `void` then `mono_runtime_invoke` will simply return `nullptr`.

Our method doesn't return anything so we won't bother dealing with that for now, but don't worry I'll be sure to cover this as well.

## Passing Parameters to a Method
Now that we can call C# methods that don't return anything or take any parameters, I think it's time to learn how we can pass parameters to C# methods from C++. Before we get started I will say that passing parameters often times involves "Marshalling" the data between unmanaged and managed memory. I won't go into too much detail about *what* marshalling is, or how Mono handles it, but [this](https://mark-borg.github.io/blog/2017/interop/) article explains it in a pretty good way, so I highly recommend reading it if you're interested in learning more. I also recommend reading [this](https://www.mono-project.com/docs/advanced/embedding/#exposing-c-code-to-the-cil-universe:~:text=For%20example%2C%20passing,the%20marshalling%20attributes) example of marshalling in Mono specifically.

It's important to note that Mono will almost never handle marshalling for us, meaning we will need to do some manual type checking and coversions later on, for now we'll just be passing a simple float, which doesn't need to be marshalled in the first place.

### The Code
```cpp
void CallIncrementFloatVarMethod(MonoObject* objectInstance, float value)
{
    // Get the MonoClass pointer from the instance
    MonoClass* instanceClass = mono_object_get_class(objectInstance);

    // Get a reference to the method in the class
    MonoMethod* method = mono_class_get_method_from_name(instanceClass, "IncrementFloatVar", 1);

    if (method == nullptr)
    {
        // No method called "IncrementFloatVar" with 1 parameter in the class, log error or something
        return;
    }

    // Call the C# method on the objectInstance instance, and get any potential exceptions
    MonoObject* exception = nullptr;
    void* param = &value;
    mono_runtime_invoke(method, objectInstance, &param, &exception);

    // OR

    MonoObject* exception = nullptr;
    void* params[] =
    {
        &value
    };

    mono_runtime_invoke(method, objectInstance, params, &exception);

    // TODO: Handle the exception
}

// ...
MonoObject* testInstance = InstantiateClass("", "CSharpTesting");
CallIncrementFloatVarMethod(testInstance, 5.0f);
```

### Explaining the Code
Alright, as you can see the code is very similar to when we didn't pass any parameters, so I won't explain all the code *again*. You can see that in the first example we declare a variable of type `void*` called `param`, and simply assign it to the memory address of `value`. The reason we do this, and the reason why it's fine to assign it to hold the memory address of a temporary value, is because `mono_runtime_invoke` has to be capable of accepting *any* parameter type, and Mono is a C library meaning templates are out of the question.

In our simple case Mono will most likely just copy the data stored at that memory address directly into managed memory, since it's a simple float. Keep in mind that some types may require us to manually marshal the data, either by constructing an instance of a C# class, or by converting a C-style string to a `MonoString*` and passing that.

I'll be sure to cover how we can handle these cases later on.

In the second example we don't just declare a `void*`, but rather an *array* of `void*`. We would do this if we need to pass multiple parameters to the method, and we'd have to make sure that the array stores the parameters in the same order that they're declared in the method signature.

If you're wondering how Mono knows what the size of the data array that we pass is, it's simply because it expects the total size of that array to equal the size of *all* the parameters in the C# method, meaning if the array size doesn't match the parameter count you will end up with problems, and Mono *may* not tell you about it.

And that's the basics of how we can retrieve and invoke C# methods from C++! I will obviously go into more depth about parameter types and how we can convert between C++ types and C# types later on.
