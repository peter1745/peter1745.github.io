# Fields and Properties
In this section we'll cover how we can get a reference to, and interact with *both* C# fields and properties. The only reason why I'll cover properties alongside fields is because Mono let's us interact with properties as if they were regular fields (almost), even though properties are essentially just syntactical sugar around a field and 2 methods.

If you want to read up more on properties in C# check [this](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/properties) article from the Microsoft Docs.

Now as with most things in Mono there's several ways of getting a reference to a C# field or property, and which one you'll use depends on if you want to iterate through all fields and properties, or if you want to get any specific field or property. It's also important to note that as with methods we don't get a field or property from an instance of class, but rather from the class itself, and then we simply access the field or property *using* the class instance.

Alright now that we understand that it's time to take a look at the code, you'll probably notice that I've changed the C# class code a bit.

## Getting References to Fields and Properties
```cs
using System;

public class CSharpTesting
{
    public float MyPublicFloatVar = 5.0f;

    private string m_Name = "Hello";
    public string Name
    {
        get => m_Name;
        set
        {
            m_Name = value;
            MyPublicFloatVar += 5.0f;
        }
    }

    public void PrintFloatVar()
    {
        Console.WriteLine("MyPublicFloatVar = {0:F}", MyPublicFloatVar);
    }

    private void IncrementFloatVar(float value)
    {
        MyPublicFloatVar += value;
    }

}
```

And on the C++ side of things:
```cpp
MonoObject* testingInstance = InstantiateClass("", "CSharpTesting");
MonoClass* testingClass = mono_object_get_class(testingInstance);

// Get a reference to the public field called "MyPublicFloatVar"
MonoClassField* floatField = mono_class_get_field_from_name(testingClass, "MyPublicFloatVar");

// Get a reference to the private field called "m_Name"
MonoClassField* nameField = mono_class_get_field_from_name(testingClass, "m_Name");

// Get a reference to the public property called "Name"
MonoProperty* nameProperty = mono_class_get_property_from_name(testingClass, "Name");

// Do something

```

### Explanation
Now we have some *very* basic code that allows us to get a reference to all the fields an properties we want.

Before I show you how we can interact with them I want to take a moment to explain something: Mono does **not** care about the accessibility of classes, methods, fields or properties that we want to access.

Do you want to set the value of a private field? Mono let's you. Want to set a private property to `null` in the middle of an update loop and crash the entire application? You can do that. Mono does *not* care.

Which of course means that it's *our* responsibility to respect the accessibility of all of those. Now, I'm not saying that you should completely ignore non-public fields or properties, it can be very useful to be able to access those for debuggability reasons.

But what I *am* saying is that your scripting engine should *never* be able to set the value of a non-public field or property *unless* the writer of that code explicitly allows it.

You can for an example add a C# attribute that the user can add to their private fields that tells the scripting engine that it can set the value of that field, in Hazel we have an attribute called `ShowInEditor` which allows the engine to set the value of that field. Unity has `SerializeField` which does the same.

Alright, now let's see how we can get e.g the accessibility of the fields and properties that we just retrieved.

## Checking Accesibility
```cpp

enum class Accessibility : uint8_t
{
    None = 0,
    Private = (1 << 0),
    Internal = (1 << 1),
    Protected = (1 << 2),
    Public = (1 << 3)
};

// Gets the accessibility level of the given field
uint8_t GetFieldAccessibility(MonoClassField* field)
{
    uint8_t accessibility = (uint8_t)Accessibility::None;
    uint32_t accessFlag = mono_field_get_flags(field) & MONO_FIELD_ATTR_FIELD_ACCESS_MASK;

    switch (accessFlag)
    {
        case MONO_FIELD_ATTR_PRIVATE:
        {
            accessibility = (uint8_t)Accessibility::Private;
            break;
        }
        case MONO_FIELD_ATTR_FAM_AND_ASSEM:
        {
            accessibility |= (uint8_t)Accessibility::Protected;
            accessibility |= (uint8_t)Accessibility::Internal;
            break;
        }
        case MONO_FIELD_ATTR_ASSEMBLY:
        {
            accessibility = (uint8_t)Accessibility::Internal;
            break;
        }
        case MONO_FIELD_ATTR_FAMILY:
        {
            accessibility = (uint8_t)Accessibility::Protected;
            break;
        }
        case MONO_FIELD_ATTR_FAM_OR_ASSEM:
        {
            accessibility |= (uint8_t)Accessibility::Private;
            accessibility |= (uint8_t)Accessibility::Protected;
            break;
        }
        case MONO_FIELD_ATTR_PUBLIC:
        {
            accessibility = (uint8_t)Accessibility::Public;
            break;
        }
    }

    return accessibility;
}

// Gets the accessibility level of the given property
uint8_t GetPropertyAccessbility(MonoProperty* property)
{
    uint8_t accessibility = (uint8_t)Accessibility::None;
    
    // Get a reference to the property's getter method
    MonoMethod* propertyGetter = mono_property_get_get_method(property);
    if (propertyGetter != nullptr)
    {
        // Extract the access flags from the getters flags
        uint32_t accessFlag = mono_method_get_flags(propertyGetter, nullptr) & MONO_METHOD_ATTR_ACCESS_MASK;

        switch (accessFlag)
        {
            case MONO_FIELD_ATTR_PRIVATE:
            {
                accessibility = (uint8_t)Accessbility::Private;
                break;
            }
            case MONO_FIELD_ATTR_FAM_AND_ASSEM:
            {
                accessibility |= (uint8_t)Accessbility::Protected;
                accessibility |= (uint8_t)Accessbility::Internal;
                break;
            }
            case MONO_FIELD_ATTR_ASSEMBLY:
            {
                accessibility = (uint8_t)Accessbility::Internal;
                break;
            }
            case MONO_FIELD_ATTR_FAMILY:
            {
                accessibility = (uint8_t)Accessbility::Protected;
                break;
            }
            case MONO_FIELD_ATTR_FAM_OR_ASSEM:
            {
                accessibility |= (uint8_t)Accessibility::Private;
                accessibility |= (uint8_t)Accessibility::Protected;
                break;
            }
            case MONO_FIELD_ATTR_PUBLIC:
            {
                accessibility = (uint8_t)Accessbility::Public;
                break;
            }
        }
    }

    // Get a reference to the property's setter method
    MonoMethod* propertySetter = mono_property_get_set_method(property);
    if (propertySetter != nullptr)
    {
        // Extract the access flags from the setters flags
        uint32_t accessFlag = mono_method_get_flags(propertySetter, nullptr) & MONO_METHOD_ATTR_ACCESS_MASK;
        if (accessFlag != MONO_FIELD_ATTR_PUBLIC)
            accessibility = (uint8_t)Accessibility::Private;
    }
    else
    {
        accessibility = (uint8_t)Accessibility::Private;
    }

    return accessibility;
}

// ...

MonoObject* testingInstance = InstantiateClass("", "CSharpTesting");
MonoClass* testingClass = mono_object_get_class(testingInstance);

// Get a reference to the public field called "MyPublicFloatVar"
MonoClassField* floatField = mono_class_get_field_from_name(testingClass, "MyPublicFloatVar");
uint8_t floatFieldAccessibility = GetFieldAccessibility(floatField);

if (floatFieldAccessibility & (uint8_t)Accessibility::Public)
{
    // We can safely write a value to this
}

// Get a reference to the private field called "m_Name"
MonoClassField* nameField = mono_class_get_field_from_name(testingClass, "m_Name");
uint8_t nameFieldAccessibility = GetFieldAccessibility(nameField);

if (nameFieldAccessibility & (uint8_t)Accessibility::Private)
{
    // We shouldn't write to this field
}

// Get a reference to the public property called "Name"
MonoProperty* nameProperty = mono_class_get_property_from_name(testingClass, "Name");
uint8_t namePropertyAccessibility = GetPropertyAccessibility(nameProperty);

if (namePropertyAccessibility & (uint8_t)Accessibility::Public)
{
    // We can safely write a value to the field using this property
}

// Do something

```
### Explanation
Now, I know that was a lot of code, but I *highly* recommend that you make sure you don't write to non-public variables unless the person who wrote the code allows it, since they probably don't expect the scripting engine to do so normally.

You may notice that we store the accessibility in a bit field, the reason for this is because C# allows you to mark class fields and properties as `protected internal` or `private protected`. In which case it's more efficient for us to store e.g both `Accessibility::Protected` *and* `Accessibility::Internal` in the same variable. Now it's entirely possible that you only care if the field / property is *public* or not, in which case you could just return a bool and call the function e.g `IsFieldPublic` / `IsPropertyPublic`.

#### GetFieldAccessibility
So how does `GetFieldAccessibility` work? Well it's very simple, we start by retrieving all the flags set on the passed field (which stores more than just accessibility data), and then we extract the accessibility data from that by using the bitwise AND operator on the flags and the `MONO_FIELD_ATTR_FIELD_ACCESS_MASK` mask.

This will give us a value that represents one of these possible access types:
* MONO_FIELD_ATTR_PRIVATE
* MONO_FIELD_ATTR_FAM_AND_ASSEM
* MONO_FIELD_ATTR_ASSEMBLY
* MONO_FIELD_ATTR_FAMILY
* MONO_FIELD_ATTR_FAM_OR_ASSEM
* MONO_FIELD_ATTR_PUBLIC

You can look at the code if you're curios as to what each of these represents. So, we do a `switch` on the access flag, and check for each of these values, then simply assign the correct `Accessibility` value to the `accessibility` variable depending on which `case` statement we hit.

#### GetPropertyAccessibility
As you can probably tell from the code getting the accessibility of a property isn't *quite* as easy as getting it from a field. The reason for this is because a property essentially represents two *methods*. A getter and a setter. Meaning we can't directly query the accessibility of the property, but rather we have to query the accessibility of the *methods*. This is made even more complicated by the fact that that properties are not *required* to have *both* a getter **and** a setter, only one is required. And if you create an auto-property, e.g `public string MyProp => m_MyValue;` C# will only generate a getter, not a setter.

So, here's how that works. We start by getting a reference to the getter method, which we can do easily by calling `mono_property_get_get_method` and passing in the property. We then get the accessibility flags from that getter (if it exists) by calling `mono_method_get_flags` and passing in the getter method, as well as `nullptr`. That last parameter simply represents the method implementation flags. If you're curios about what these are you can check [this](https://docs.microsoft.com/en-us/dotnet/api/system.reflection.methodimplattributes?view=netframework-4.7.2) article. We're passing `nullptr` because we're not interested in those flags right now.

And just like we did in `GetFieldAccessibility` we perform a bitwise AND operation to get the accessibility flag, perform a `switch` on that and store the result in the `accessibility` variable.

After we've done that we do something similiar with the setter, assuming it exists, the difference is that for the setter we only check if it's *not* public, in which case we set the `accessiblity` variable to `Accessibility::Private`, since we can't write to the property if the setter is private. We also set the accessiblity to private if there is no setter.

Another difference between the getter and setter is that for the setter we obviously have to call `mono_property_get_set_method` instead of `mono_property_get_get_method`.

## Setting and Getting Values
Alright after that very lengthy talk about accessibility it's finally time to set and get some values! Now this is can be a *very* complex topic, especially when you start dealing with actually marshalling data, we won't be dealing with that too much right now though.

We'll start by getting and setting the value of `MyPublicFloatVar`, and then we'll move on to doing the same for the `Name` property.

```cpp
bool CheckMonoError(MonoError& error)
{
	bool hasError = !mono_error_ok(&error);
	if (hasError)
	{
		unsigned short errorCode = mono_error_get_error_code(&error);
		const char* errorMessage = mono_error_get_message(&error);
        printf("Mono Error!\n");
        printf("\tError Code: %hu\n", errorCode);
        printf("\tError Message: %s\n", errorMessage);
		mono_error_cleanup(&error);
	}
	return hasError;
}

std::string MonoStringToUTF8(MonoString* monoString)
{
	if (monoString == nullptr || mono_string_length(monoString) == 0)
		return "";

	MonoError error;
	char* utf8 = mono_string_to_utf8_checked(monoString, &error);
	if (CheckMonoError(error))
		return "";
	std::string result(utf8);
	mono_free(utf8);
	return result;
}

MonoObject* testingInstance = InstantiateClass("", "CSharpTesting");
MonoClass* testingClass = mono_object_get_class(testingInstance);

MonoClassField* floatField = mono_class_get_field_from_name(testingClass, "MyPublicFloatVar");

// Get the value of MyPublicFloatVar from the testingInstance object
float value;
mono_field_get_value(testingInstance, floatField, &value);

// Increment value by 10 and assign it back to the variable
value += 10.0f;
mono_field_set_value(testingInstance, floatField, &value);

MonoProperty* nameProperty = mono_class_get_property_from_name(testingClass, "Name");

// Get the value of Name by invoking the getter method
MonoString* nameValue = (MonoString*)mono_property_get_value(nameProperty, testingInstance, nullptr, nullptr);
std::string nameStr = MonoStringToUTF8(nameValue);

// Modify and assign the value back to the property by invoking the setter method
nameStr += ", World!";
nameValue = mono_string_new(s_AppDomain, nameStr.c_str());
mono_property_set_value(nameProperty, testingInstance, (void**)&nameValue, nullptr);

```

### Explanation
#### Fields
So, there's a lot to unpack here. We'll start with the `mono_field_get_value` function. It takes three parameters, the first one being the class instance that we want to get the value from, the second one being the field we want to get the value from, and the third being a pointer to a variable that will hold the value C++ side.

One of the most important things you have to understand here is the difference between getting a value type like a float, or an int or even a struct, and getting a reference type like a class.
If you're getting a value type as long as the value isn't boxed, like we're doing, you can simply declare a variable of the C++ equivalent type and pass the memory address of that variable. The size of the C++ type *has* to match the size of the C# type though, and if you're using a struct the layout has to match as well.

If you're getting a reference type though you have to declare a `MonoObject` pointer, since reference types are *always* allocated on the heap.

Alright, with that out of the way we can increment the value and reassign it to the field by calling `mono_field_set_value`, passing in the class instance, the field and the memory address of the variable, assuming it's a value type.

If you wanted to confirm that the C# field got updated correctly you could simply retrieve the value again and check that. Naturally you'd probably want to have a flexible system set up that will handle these conversions in a better way, and that adds a degree of type-safety since Mono will simply accept the value as long as the size of it matches the C# field, and it will most likely not tell you that anything's wrong.

#### Properties
Alright, now it's time to get to how we get and set values when dealing with properties, unfortunately it's quite a bit different from dealing with fields. I will not be explaining the `CheckMonoError` or the `MonoStringToUTF8` in detail, I'll leave that for later. But in short the `MonoStringToUTF8` simply takes a `MonoString` pointer, which simply holds a pointer to the C# managed string, and it then copies that into unmanaged memory and returns an `std::string`.

And `CheckMonoError` simply extracts an error code and message from the given `MonoError` struct and then logs that to the console.

First of all we call `mono_property_get_value`, which will invoke the properties getter method for us. The first two parameters are simply the property itself and the class instance. The last two parameters, where we pass nullptr represent any parameters that the getter method might expect, and lastly a pointer to a `MonoException*` that we can get back from the method in case it throws one. The third parameter doesn't really make sense in my opinion since a property's getter method *can't* take any parameters that I'm aware of, so I'll always pass `nullptr`.

As you can see we're getting a string, and because of that we simply get a pointer to a `MonoString` struct, which holds a pointer to the C# string, in managed memory. It's important to note that `mono_property_get_value` returns a `MonoObject` pointer, which in the case of a string should simply be cast to a `MonoString` pointer.

In the case of e.g a value type it will return the value boxed inside a `MonoObject`, meaning we'll have to unbox it. I *highly* recommend you read up on boxing and unboxing [here](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing).

But since in this case we're getting a string we simply cast it, and then convert it to an `std::string`. As you can see we do use `mono_string_to_utf8_checked`, and I wanted to mention that if there is a "checked" version of a Mono function available you should **always** use that one, and **never** the unchecked version. This function also returns a pointer to a buffer, and we're in charge of freeing it after we're done with it. So keep that in mind.

If you want to see how to deal with unboxing value types like floats, see the code I've written below.

Alright, now that we've got our string and we've modified it, it's time to assing it back to C#. As I'm sure you're aware we're doing a *lot* of copying here, but don't worry too much about it since you most likely won't be getting and setting C# values from C++ every frame.

In order to invoke the setter function of the property we call `mono_property_set_value`, and just like with the getter we pass the property and the class instance. Then we have to pass the value itself. The last parameter is again a pointer to a `MonoObject*`, which will contain any exceptions thrown by the setter. I'm passing `nullptr` here again.

The important thing to understand about `mono_property_set_value` is that you *cannot* pass the memory address of value types directly like you can with `mono_field_set`. This function will crash if you do.

What you need to do instead is create an array of `void*` and store the address in that array. I'm not sure why this is the case but it is. So you'd something along the lines of `void* data[] = { &myValueTypeData };` and then pass that array like this: `mono_property_set_value(prop, instance, data, nullptr);`.

In the case of a `MonoObject*` or a `MonoString*` you can simply pass the memory address and cast it to a `void**`. Although I do recommend going with the `void*` array approach, since that works at all times.

You can probably tell that in the example above we call `mono_string_new`, and pass the AppDomain as well as the C string in order to construct a new `MonoString`. We do this because we can't, and shouldn't attempt to modify the `MonoString` we got from the property, I won't go into *too* much detail on strings because I'll cover them in-depth later on.

### Dealing with Value Types and Properties
```cpp
MonoProperty* floatProperty = mono_class_get_property_from_name(testingClass, "MyFloatProperty");

// Get the value of Name by invoking the getter method
MonoObject* floatValueObj = mono_property_get_value(floatProperty, testingInstance, nullptr, nullptr);
float floatValue = *(float*)mono_object_unbox(floatValueObj);

// Modify and assign the value back to the property by invoking the setter method
floatValue += 10.0f;
void* data[] = { &floatValue };
mono_property_set_value(nameProperty, testingInstance, data, nullptr);
```

Alright! Now we're done with the *basics* of fields and properties. *Yes, I know it's ironic that I call this the basics considering the length of this article but it's important that you really understand how it works*.

There is so much more that I'd like to cover when it comes to dealing with fields and properties, but I have to restrain myself or this article will be 50,000 paragraphs. In the next section we'll cover Internal Calls, which will allow C# code to call C++ functions.
