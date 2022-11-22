# Introduction
## About Me
Hi, my name is Peter, and I'm a game engine developer from Sweden, I'm also the author of this guide. I've been working on a game engine called [Hazel](https://www.hazelengine.com/) for over a year, and one of the things I've worked on is a C# scripting engine, using the Mono library.

Hazel is not my own personal engine, and it was originally created by [Yan Chernikov](https://thecherno.com/). I joined the project in September of 2020 as a volunteer, and now I'm lucky enough to be able to work on it as an actual job.

## The goal of this guide
The goal of this guide is to help you embed the [Mono](https://www.mono-project.com/) library into your game engine. For the past few months I've been working on rewriting the C# scripting engine in Hazel, and I kept getting frustrated because there's very little in terms of useful documentation on how to use Mono in the scope of a game engine.

Yes, Mono *does* have a documentation site for embedding: [http://docs.go-mono.com/](http://docs.go-mono.com/?link=root%3a%2fembed), but in my experience it's all but useless. There are a few open source (or at least source available) projects out there that have embedded Mono, but there's no real *documentation* available.

**So**, that's why I decided to create this guide. I've been through the pain of googling for hours to figure out how to do something in Mono, and I figured I could help spare others from that pain.

Before we get started I just wanted to say that this guide is **not** a guide on building a complete scripting engine, it's just meant to give you the knowledge you *need* to write a scripting engine.

I will also mention that the "First Steps" section only covers the very basics, I'll go into way more depth and show more complex code in a more advanced section later on.

## Credits
I'm not the only person who has contributed to this. I've had some help with certain parts of it, so I wanted to make sure to mention anyone that has helped out.

- **Marca**, provided build instructions for Mac OSX

## The Game Engine Series
As I've mentioned this guide *isn't* meant to teach you how to write a fully fledged scripting engine. But there *is* a series on YouTube that *does* cover writing a scripting engine in C++, the [Game Engine Series](https://www.youtube.com/playlist?list=PLlrATfBNZ98dC-V-N3m0Go4deliWHPFwT) from [The Cherno](https://www.youtube.com/c/TheChernoProject).

The scripting engine that he's writing is based on the scripting engine that I wrote for Hazel, and he does reference this guide as well. I highly recommend watching the C# scripting related episodes if you're interested in how you can design an actual scripting API.

Understandably there's a *lot* of different ways of writing a scripting engine, and there's no "correct" way of doing so, although there are worse ways and better ways, as with everything.
