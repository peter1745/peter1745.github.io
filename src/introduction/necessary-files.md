# Getting the Necessary Files
Now it's time for us to get all the necessary files that we'll need to embed the Mono runtime. This includes the Mono libraries and the .NET libraries. Naturally the files are called different things and located in different places depending on the platform, but I'll provide the necessary files and locations for Windows, MacOSX and Linux.

You can use these links to quickly jump to your platform:
- [Windows](#windows)
- [Linux (Coming Soon!)](#linux)
- [Mac OSX](#macosx)

## Windows
### Native Libraries
All of Mono's native libraries should've been built into `mono-root/msvc/build/sgen/{platform}/`, where `{platform}` is either `x64` or `Win32`.

In that folder you'll see three other folders called `bin`, `lib` and `obj`, we're only interested in the `bin` and `lib` folders.
Both of those will have either one or two subfolders based on if you built both `Release` and `Debug`, or only `Release` or only `Debug`.

I will only be telling you *what* files you'll need, how *you* choose to structure your projects dependencies is up to you.

So, here's the native libraries that you'll need from `lib`:
- eglib.lib
- libgcmonosgen.lib
- libmini-sgen.lib
- libmonoruntime-sgen.lib
- libmono-static-sgen.lib
- libmonoutils.lib
- mono-2.0-sgen.lib
- MonoPosixHelper.lib

You're also going to need some files from the `bin` folder, these files will have to be placed next to your applications executable. These are the DLL files you'll need from `bin`:
- mono-2.0-sgen.dll
- MonoPosixHelper.dll

### .NET Libraries
You don't technically **have** to copy the .NET libraries into your own program, you can tell the Mono runtime where they're located, but I like having them be a part of the project, so I'll be copying them.

I won't be providing a full list of the files that you'll need, there's a lot of them, instead I'll just tell you what folders you'll need to copy.

If you've installed Mono locally (not just cloned it) you'll have to navigate to the folder where you installed it, in my case I installed it to `C:\Program Files\Mono`. Inside that install folder you'll want to navigate to `lib/mono`, and you should see a bunch of folders that have numbers, and some that have an `-api` postfix.

The main folder you'll want is the one called `4.5`, just make sure you copy it into a `lib` folder, located inside of a folder called `mono`. In my case it would be `D:\dev\MyGameEngine\MyEditor\mono\lib`.
I may end up covering the other folders at a later date, but I have only recently started experimenting with them myself so I don't want to provide incorrect information here.

If you built the .NET libraries from source you'll have to navigate to `mono-root/mcs/class/corlib`, and you *should* find the same folders there. I haven't done this myself so I could be incorrect, if so please open an issue in the GitHub repo for this page. Located here: [https://github.com/peter1745/peter1745.github.io](https://github.com/peter1745/peter1745.github.io).

### Header Files
Getting the correct header files is really easy, they're located in `mono-root/msvc/include/`. You'll probably want to copy the `mono` folder, so that when you go to include a Mono header file you type `#include <mono/somedir/somefile.h>`.

That's it! You've now got all the files you'll need to embed the Mono runtime.

Before we continue I will say that *most* of the time you'll only need to link with `mono-2.0-sgen.lib`, but you should still keep the other .lib files around in case you need them later on, or you can delete them if you want to minimize the size of your project as much as possible.

Also remember to at the very least copy `mono-2.0-sgen.dll` to the same folder as your applications executable.

## Linux
**Coming Soon!**

## MacOSX
### Native Libraries
All the necessary native libraries you'll need should be located in the output folder that you specified when you built Mono. You'll find a folder called `lib` in there, that's where the libraries are located.

So, here's the native libraries that you'll need from `lib`:
- libeglib.a
- libmonoutils.a
- libMonoPosixHelper.dylib
- libmonosgen-2.0.dylib (This is most likely a symlink for libmonosgen-2.0.1.dylib)

### .NET Libraries
You don't technically **have** to copy the .NET libraries into your own program, you can tell the Mono runtime where they're located, but I like having them be a part of the project, so I'll be copying them.

I won't be providing a full list of the files that you'll need, there's a lot of them, instead I'll just tell you what folders you'll need to copy.

If you've installed Mono locally (not just cloned it) you'll have to navigate to the folder where you installed it. Inside that install folder you'll want to navigate to `lib/mono`, and you should see a bunch of folders that have numbers, and some that have an `-api` postfix.

The main folder you'll want is the one called `4.5`, just make sure you copy it into a `lib` folder, located inside of a folder called `mono`.
I may end up covering the other folders at a later date, but I have only recently started experimenting with them myself so I don't want to provide incorrect information here.

If you built the .NET libraries from source you'll have to navigate to the output directory that you specified when you built Mono, and navigate to `lib/mono/`, and you *should* find the same folders there. I haven't done this myself so I could be incorrect, if so please open an issue in the GitHub repo for this page. Located here: [https://github.com/peter1745/peter1745.github.io](https://github.com/peter1745/peter1745.github.io).

### Header Files
Getting the correct header files is really easy, they're located in `include/` in the output directory you specified when you built Mono. You'll probably want to copy the `mono` folder, so that when you go to include a Mono header file you type `#include <mono/somedir/somefile.h>`.

That's it! You've now got all the files you'll need to embed the Mono runtime.

Before we continue I will say that *most* of the time you'll only need to link with `libmonosgen-2.0.dylib`, but you should still keep the other files around in case you need them later on, or you can delete them if you want to minimize the size of your project as much as possible.

## All Done!
Alright, now you should have all the necessary files, and your project *should* be configured correctly, but if you don't know how to e.g link the Mono libraries to your project, or add the include directory, well, then *maybe* you shouldn't be considering embedding Mono just yet.

Once you've got your project configured and linking with Mono, feel free to move on to the "Setting up the Runtime" section of this guide!
