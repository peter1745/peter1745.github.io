# About Mono
## What *is* Mono?
I would assume that you already know what Mono is since you decided to check out this guide, but I'll give a short explanation just in case.

In short: Mono is an open source implementation of Microsoft's [.NET Framework](https://en.wikipedia.org/wiki/.NET_Framework). It was originally designed to bring .NET languages (mostly C#) to platforms other than Windows.
Nowadays it's not strictly necessary for cross-platform support, since Microsoft has been working on making .NET cross-platform natively. But Mono is still very useful for scripting engines, because unlike .NET Core, or .NET Framework, it provides a decent C/C++ API for embedding a .NET runtime.

## Multiple versions of Mono?
Now, there are actually *two* versions of Mono, there's what I call "Classic Mono", which is mainly what we'll be covering here, then there's what I call the ".NET Core Mono". I won't get into the differences between .NET Core and .NET Framework, but the biggest difference is that classic Mono only supports up to C# 7, or .NET Framework 4.7.2, where as .NET Core Mono supports the latest version of C#, and is developed as part of the .NET Runtime project.

Both versions of Mono are developed by Microsoft, but classic Mono isn't *integrated* into .NET, where as .NET Core Mono *is*. I will eventually cover building the .NET Core version of Mono as well, but I'll start by covering classic Mono because it's simpler, and more suited for game engines (I'll explain why later on).

## Why not use the .NET Core version?
So, why aren't we going to use the .NET Core version of Mono? Simply put: It doesn't support *assembly reloading*. If you don't know what C# assemblies are I'd recommend you read up a bit on them, but they're essentially a DLL file that contains all your code, converted to an intermediate language (commonly referred to as "IL" or "Bytecode").

So why does assembly reloading matter in this case? Because when you, or anyone else, is writing C# scripts you want the changes you make to the code to take effect in the engine (or editor) immediately, without having to restart the entire editor / game. And in order to do so we first have to unload the old assembly, and load in the new one, without restarting the program.

And in its current state the .NET Core version of Mono doesn't support unloading C# assemblies, where as classic Mono does. When I was initially rewriting the scripting engine for Hazel I wanted to use the .NET Core version because it would've meant that we could support the latest C# version. And unfortunately I only discovered that assembly unloading wasn't supported about 3 months into rewriting the scripting engine...

As it was I got in touch with the developers of Mono to ask them if it was possible to reload assemblies in any way, and they told me no. So I asked them if they knew *when* that would be supported, and they told me they didn't know... (Yes, I may still be *slightly* annoyed with them for releasing the .NET Core version without assembly reloading support)

But **when** the .NET Core version supports assembly reloading I'll make sure to update this book with instructions on how to use that version of Mono (assuming I remember doing so).

But regardless, let's move on to cloning Mono from GitHub, and building the necessary libraries in the next chapter!