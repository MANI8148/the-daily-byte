---
title: "Unreal C++ Course Chapter 109: Enum Setup for Character States"
kicker: OPEN SOURCE / TUTORIAL
description: A dev.to Unreal C++ walkthrough shows how to declare character equip-state enums in a shared header file with clean encapsulation naming.
slug: unreal-cpp-course-chapter-109-enum-setup-character-states
date: 2026-09-21
author: The Daily Byte
tags: ["unreal-engine", "cpp", "tutorial", "game-dev"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-09-21/unreal-cpp-course-chapter-109-enum-setup-character-states.jpg"
---

Chapter 109 of the Unreal C++ course on dev.to tackles a deceptively simple piece of game-code infrastructure: enumerations for the player character's equip state. For anyone who has watched an Unreal project devolve into a spaghetti of magic integers representing "armed," "unarmed," "reloading," the tutorial's approach to `ECharacterEquipState` is worth pausing on, because it exposes a pattern that scales past the first weapon slot.

## What the chapter actually builds

The author wires up an enumeration for the `AEchoCharacter` player class, isolating the enum declarations in a dedicated `CharacterState.h` header. That header is deliberately not glued to equipping alone; the same file already carves out space for Alive/Dead, Climbing/Swimming, and other state buckets the author anticipates needing later.

That separation is the real takeaway. A single header becomes the contract for "what state is this character in," instead of scattering `enum` definitions across multiple actor headers.

## Why enumerations beat raw integers here

Unreal's reflection system and Blueprint interop both behave better when they see named enumerations rather than plain `int` values. In practice this means:

- Compile-time checking catches typos like `EquipState::Meele` vs `EquipState::Melee`.
- Blueprints expose a dropdown instead of a cryptic number field.
- Debugger output shows `ECharacterEquipState::Drawing` instead of `2`.

The chapter's `ECharacterEquipState` naming also follows Unreal's convention: the `E` prefix signals "enum" to anyone scanning the codebase, and the scoped name keeps it out of the global namespace.

## The shared header pattern in detail

The tutorial drops the enum into `CharacterState.h` and includes that header wherever the character needs state checks. A minimal version looks like this:

```cpp
// CharacterState.h
#pragma once

#include "CoreMinimal.h"
#include "CharacterState.generated.h"

UENUM(BlueprintType)
enum class ECharacterEquipState : uint8
{
    Unequipped UMETA(DisplayName = "Unequipped"),
    Equipping   UMETA(DisplayName = "Equipping"),
    Equipped    UMETA(DisplayName = "Equipped"),
    Unequipping UMETA(DisplayName = "Unequipping")
};
```

A few things worth noticing:

- `UENUM(BlueprintType)` makes the enum visible inside Blueprints.
- `UMETA(DisplayName = ...)` gives human-readable labels without changing the C++ identifiers.
- `: uint8` keeps the underlying storage small, which matters when you have many characters in a level.

## Encapsulation naming as documentation

The author chose `ECharacterEquipState` specifically, rather than a generic `EEquipState`. That prefix encodes three things: it is an enum, it belongs to a character, and it describes equip behavior. When `CharacterState.h` later adds `ECharacterMovementState` or `ECharacterHealthState`, the naming pattern lets you scan a `switch` statement and immediately know which domain you are in.

## Reuse across Alive/Dead, Climbing, Swimming

The header is deliberately sized to grow. The author mentions Alive/Dead and Climbing/Swimming as planned additions, which suggests a single `CharacterState.h` could eventually host a half-dozen related enums. That is convenient, but it is also a design fork: at some point the file becomes a catch-all, and splitting by domain (combat vs. movement vs. life-state) may be cleaner. The tutorial does not resolve that tension, which is fair for a chapter focused on setup.

## The part the author pushed back on

The summary cuts off mid-sentence at "Although I didn't fully agree with making..." but the phrasing suggests the author disagreed with a design decision in the course material itself, possibly around how tightly the enum couples to the character class or how the state transitions are triggered. That kind of dissent is useful signal: the tutorial is giving you a working baseline, not gospel. Evaluate whether the pattern fits your project's complexity before copying it wholesale.

## Verify it yourself

To reproduce the chapter's setup:

1. Create `CharacterState.h` in your project's `Source/YourProject/Public` folder.
2. Paste the enum skeleton above, adjusting values to your needs.
3. Include the header in your character class: `#include "CharacterState.h"`.
4. Add a `UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="State") ECharacterEquipState EquipState;` member to `AEchoCharacter`.
5. Recompile and open the Blueprint; the enum should appear in the dropdown.

If the enum does not show up in Blueprints, check that `UENUM(BlueprintType)` is present and that the header is in your build rules (usually automatic if it lives in `Public/`).

## Key takeaways

- Isolate character-state enums in a shared header rather than embedding them inside individual actor files.
- Use Unreal's `UENUM(BlueprintType)` + `UMETA(DisplayName)` to keep C++ and Blueprint in sync.
- Name enums with an `E` prefix and a domain qualifier (`ECharacterEquipState`) so future readers know the scope at a glance.
- Expect the shared header to grow; plan for splitting it before it becomes a dumping ground.
- Treat course design decisions as starting points, not final architecture-especially when the author themselves flags a disagreement.