# Setting up the Runtime
Now that we've built Mono, gotten all the necessary files, and *hopefully* setup our project correctly, it's time to start coding! The very first thing we have to do is initialize the Mono runtime.

In order to properly initialize Mono we have to start by including `mono/jit/jit.h`, and `mono/metadata/assembly.h`. Once that's done we have to let Mono know where the .NET libraries are located. The function we'll have to call is `mono_set_assemblies_path`. Keep in mind that the path provided to this function have to either be an absolute path (e.g `D:\dev\Engine\mono\lib`), or a path relative to the current working directory (e.g `mono/lib`).

So in my case it would look like this:
```cpp
void InitMono()
{
    mono_set_assemblies_path("mono/lib");
}
```
If you don't provide this path to Mono you'll see an error message printed in the console, it would look something like this:
![MSCorlibError](/res/mscorlib-error.jpg)

I will say that if you don't provide this path, but you have a **MONO_PATH** environment variable that points to the correct folder Mono will attempt to use that path to located `mscorlib.dll`.

Once we've told Mono where it can locate mscorlib we can actually start the runtime. We have to call `mono_jit_init` in order to start the runtime, but you may notice that there's actually another function with a similiar name: `mono_jit_init_version`, so what's the difference?
Well the difference has to do with what version of the runtime we use. By using the first function (`mono_jit_init`) we're telling Mono to use the runtime version referenced by the *first* assembly that we load, meaning it will automatically detect it. If we use the second function `mono_jit_init_version` we can specify the *exact* version of the runtime we want.

From my experimentation what function we use doesn't have much of an effect, and it's generally speaking safer to let Mono automatically pick the runtime version, so for this guide we'll be using `mono_jit_init`. We must make sure to give this function a string when calling it, this string essentially represents the name of the runtime.

When calling this function we get a `MonoDomain` pointer, it's important that we store that pointer since we have to manually clean it up later on. The interesting thing is that Mono actually stores this pointer internally as well, and according to the Mono developers it doesn't really make sense that we have to keep track of that pointer as well, but that's just the way it is, so make sure to store it somewhere.
```cpp
void InitMono()
{
    mono_set_assemblies_path("mono/lib");

    MonoDomain* rootDomain = mono_jit_init("MyScriptRuntime");
    if (rootDomain == nullptr)
    {
        // Maybe log some error here
        return;
    }

    // Store the root domain pointer
    s_RootDomain = rootDomain;
}
```

And that's the basics of initializing the Mono runtime. Naturally as we continue to develop our scripting engine further the initialization process will get more complex, but we'll cover the necessary parts when they're needed.

Now we're not quite done with the initialization, before we can load our C# assembly and start running code we have to create an [App Domain](https://docs.microsoft.com/en-us/dotnet/framework/app-domains/application-domains).

## Creating an App Domain
Mono makes it trivially easy to create a new App Domain, all we have to do is call `mono_domain_create_appdomain` and give our App Domain a name. Remember to store the `MonoDomain` pointer returned by this function somewhere, we'll need it later on. This process will become slightly more complicated in the future but for now we'll just modify our initalization function to look like this:
```cpp
void InitMono()
{
    mono_set_assemblies_path("mono/lib");

    MonoDomain* rootDomain = mono_jit_init("MyScriptRuntime");
    if (rootDomain == nullptr)
    {
        // Maybe log some error here
        return;
    }

    // Store the root domain pointer
    s_RootDomain = rootDomain;

    // Create an App Domain
    s_AppDomain = mono_domain_create_appdomain("MyAppDomain", nullptr);
    mono_domain_set(s_AppDomain, true);
}
```
You may wonder what the second parameter of `mono_domain_create_appdomain` is, well it allows us to pass a path to a configuration file. We won't be needing this so we can simply pass `nullptr`.

Once we've got our `MonoDomain` pointer we have to set our new App Domain to be the *current* App Domain, we can do this by calling `mono_domain_set` and pass our domain. The second parameter simply indicates if we want to force our domain to be set as the current domain. In reality we could probably pass `false` here since all that parameter does is forcibly set the App Domain even if it's being unloaded, but we'll just go ahead and pass `true`.

Now that we've created our AppDomain we can finally start working towards running C# code from C++! All we have to do now is load a C# assembly, which we'll cover in the next section.