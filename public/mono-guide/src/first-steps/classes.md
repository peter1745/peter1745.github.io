# Getting a reference to a C# class
So in order for us to call methods and access properties on a C# class from C++ we first have to get a reference to that class, and create an instance of it.

There are many ways of getting a reference to a C# class but the simplest is by making use of the `mono_class_from_name` function, which lets us get a class by name.

So lets say we want to get a reference to our `CSharpTesting` class, in that case our code would look something like this:
```cpp
MonoClass* GetClassInAssembly(MonoAssembly* assembly, const char* namespaceName, const char* className)
{
    MonoImage* image = mono_assembly_get_image(assembly);
    MonoClass* klass = mono_class_from_name(image, namespaceName, className);

    if (klass == nullptr)
    {
        // Log error here
        return nullptr;
    }

    return klass;
}

// ...

MonoClass* testingClass = GetClassInAssembly(appAssembly, "", "CSharpTesting");

```

## Creating an instance from our class
Once we have our class we have to actually instantiate it. Instantiating a class involves two steps, first we have to allocate the object, then we have to call the correct constructor. Let's start by taking a look at the code, there are however some things we have to keep in mind with constructors that I'll cover at a later date.

```cpp
// Get a reference to the class we want to instantiate
MonoClass* testingClass = GetClassInAssembly(appAssembly, "", "CSharpTesting");

// Allocate an instance of our class
MonoObject* classInstance = mono_object_new(s_AppDomain, testingClass);

if (classInstance == nullptr)
{
    // Log error here and abort
}

// Call the parameterless (default) constructor
mono_runtime_object_init(classInstance);
```
As you can see Mono makes it very easy to instantiate a C# class from C++.

### Explaining the Code

First we retrieve our C# class, after that we have to *allocate* the instance of that class. Now remember, allocating a class and constructing a class are two very different things, allocating simply means allocating enough memory to hold all of the class data, and constructing means calling one of the classes constructors, which will initialize all the fields and properties stored in the class.

We allocate an instance of the class by calling `mono_object_new`, and we pass two parameters: first we pass the AppDomain that we created when we initialized Mono, remember this isn't the domain we got back from `mono_jit_init`, it's AppDomain we explicitly created. Secondly we pass the actual class that we want to allocate an instance of. If everything goes they way we want it to we should end up with a new instance of that class, although `mono_object_new` *can* return nullptr.

Keep in mind that this instance is effectively *useless* until we've actually called the constructor.

After we've allocated the instance we now have to call the constructor, or *initialize* the instance. There is however a pretty big design problem we have to solve though: Classes can have *multiple* constructors. So which one do we call? Well the simplest way of solving this issue is to either know beforehand what constructors any given class will have, or we can simply enforce a requirement that *all* classes that will be constructible from C++ **have* to have a parameterless constructor.

In Hazel we use both of these approaches, for most classes we assume they will have a parameterless constructor, but we support constructors that take any number of parameters as well.

For this simple example we'll assume that all classes have a parameterless constructor though. And don't worry if you haven't explicitly added a parameterless constructor, if you don't provide any constructors at all the C# compiler will automatically generate a constructor without parameters for you. If you do provide a constructor that has parameters you will however have to create a parameterless constructor explicitly.

So what does `mono_runtime_object_init` actually do? Well it simply tries to call the parameterless constructor for the class instance that you give it. If it can't find a parameterless constructor it will assert, so we'll eventually have to manually check if the parameterless constructor exists.

Once we've called that function our `MonoObject` will be completely initialized and ready to be used, but before we get to that I'll explain what we have to keep in mind when constructing C# objects.

Now understandably for a proper scripting engine you'd want to be able to search through the entire C# assembly and effectively get a list of what scripts you can instantiate, and have everything be a bit more dynamic. But again this guide isn't teaching you how to write a scripting engine, it's simply giving you the knowledge about Mono that you'll need to write a scripting engine.

If you're really interested in writing a proper scripting engine I'd highly recommend checking out the [Game Engine Series](https://www.youtube.com/playlist?list=PLlrATfBNZ98dC-V-N3m0Go4deliWHPFwT) from [The Cherno](https://www.youtube.com/c/TheChernoProject) on YouTube. He does make some use of this guide for reference.

In the next section we'll be covering how to call C# methods from C++!