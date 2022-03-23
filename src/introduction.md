# Introduction
## About Me
Hi, my name is Peter, and I'm a game engine developer from Sweden, I'm also the author of this guide. I've been working on a game engine called [Hazel](https://www.hazelengine.com/) for over a year, and one of the things I've worked on is a C# scripting engine, using the Mono library.

Hazel is not my own personal engine, and it was originally created by [Yan Chernikov](https://thecherno.com/). I joined the project in September of 2020 as a volunteer, and now I'm lucky enough to be able to work on it as an actual job.

## The goal of this guide
The goal of this guide is to help you embed the [Mono](https://www.mono-project.com/) library into your game engine. For the past few months I've been working on rewriting the C# scripting engine in Hazel, and I kept getting frustrated because there's very little in terms of useful documentation on how to use Mono in the scope of a game engine.

Yes, Mono *does* have a documentation site for embedding: [http://docs.go-mono.com/](http://docs.go-mono.com/?link=root%3a%2fembed), but in my experience it's all but useless. There are a few open source (or at least source available) projects out there that have embedded Mono, but there's no real *documentation* available.

**So**, that's why I decided to create this guide. I've been through the pain of googling for hours to figure out how to do something in Mono, and I figured I could help spare others from that pain.

Before we get started I just wanted to say that this guide is **not** a guide on building a complete scripting engine, it's just meant to give you the knowledge you *need* to write a scripting engine.