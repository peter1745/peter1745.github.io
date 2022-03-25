# Building Mono
Building Mono isn't too hard, but it's a large library, taking up quite a lot of space on your computer, so it will probably take some time to clone, and build it.

## Platforms
Here are some links to the instructions for each platform:
- [Windows](#windows)
- [Linux (Coming Soon!)](#linux)
- [Mac OSX](#macosx)

## Cloning from GitHub
Before we can build Mono, we have to clone it from GitHub. You should hopefully know how to do this yourself, but I know *someone* won't know how to do that so I'm including this section anyway.

If you don't need a step-by-step guide for this, you should just clone [https://github.com/mono/mono](https://github.com/mono/mono).

Alright, in order to clone Mono make sure you have a Git client installed, I'll be providing commands for the command-line git client, but you could also use a GUI client.

In order to clone Mono from the command line, you just run `git clone https://github.com/mono/mono`, that's it. Yeah I know, this section feels pointless but might as well include it.

## Building classic Mono from source
Now we get to the fun part: building Mono from source. Mono is a pretty large project so building Mono can take a bit of time. I'll provide build instructions for Windows, MacOS and Linux (I'll be using Linux Mint when building).

I'll provide the pre-requisites that you'll need to build Mono on the specified platform as to save you some thinking power and pain.

### Windows
Building Mono on Windows is *ridiculously* easy, most likely easier than any other platform. I will note that using Visual Studio only works for building the Mono runtime libraries, not the .NET libraries (e.g `System.dll`, `System.Collections.Generic.dll`, etc...).

In my case I won't be building the .NET libraries from source, I'll be getting them by installing Mono locally and copying them from the install directory.

If you want to build the .NET libraries you'll need access to the `make` command, which you can use by running a [Cygwin](https://www.cygwin.com/) shell.

#### Pre Requisites
- An installed copy of Mono (might not be required but it's good to have just in case)
- Visual Studio (I'll be using Visual Studio 2022)
- Cygwin or some other tool that let's you use `make` (Only needed if you want to build the .NET libraries)

#### Building
In order to build Mono you just need to navigate to `mono/msvc/` and open up **mono.sln** in Visual Studio. All you need to do now is select the build configuration and the platform to build for.

I recommend building both the `Release` and the `Debug` configuration since only building `Release` will mean you'll have an even harder time debugging Mono related issues. If you want to build 64-bit or 32-bit doesn't really matter for the sake of this guide, but these days you really don't need to support 32-bit platforms.
After that just start the build and let it run!

If you've done everything correctly (which I assume you have since it's not hard building Mono on Windows) you can move on to the "Getting the Necessary Files" chapter.

### Linux
**Coming Soon!**

### MacOSX
Building Mono on Mac is very similar to Linux, you still use `make` and `autogen`.

#### Pre-Requisites
- An installed copy of Mono (only if you don't get `monolite`)
- Make

#### Building
The first step is to open a terminal and navigate to the root `mono` folder.

Before you continue, keep in mind that running `./autogen.sh` will cause Mono to clone all the submodules that it will need to build, this process takes quite a long time. Once you're in the root Mono folder you'll want to start by running this command: `./autogen.sh --prefix=<absolutePathToDesiredOutputDirectory> --disable-nls`.

Once that command has finished, you'll want to either install Mono locally, or get `monolite`. If you have Mono installed locally, just continue to the next step, if you want to use `monolite` however, you'll have to run: `make get-monolite-latest` in order to get it.

Once you have Mono or `monolite` you'll want to run `make`, and then `make install` to build Mono.

All the necessary libraries should've been placed in the folder you specified as part of the `--prefix` flag.
