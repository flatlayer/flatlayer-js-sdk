# Svelte Integration with Flatlayer SDK

## Introduction

The Flatlayer SDK provides seamless integration with Svelte applications, offering components and utilities to enhance your development experience. This guide provides an overview of how to use Flatlayer SDK components in your Svelte projects.

## Installation

First, ensure you have the Flatlayer SDK installed in your Svelte project:

```bash
npm install flatlayer-sdk
```

or

```bash
yarn add flatlayer-sdk
```

## Setting up Flatlayer Instance

Create a Flatlayer instance to interact with your CMS:

```javascript
// src/lib/flatlayer.js
import { Flatlayer } from 'flatlayer-sdk';
import { env } from '$env/dynamic/public';

export const flatlayer = new Flatlayer(env.PUBLIC_FLATLAYER_ENDPOINT);
```

## Key Components

The Flatlayer SDK provides two main components for Svelte integration:

1. `ResponsiveImage`: A component for rendering responsive, optimized images from your Flatlayer CMS.
2. `Markdown`: A component for rendering Markdown content with embedded components.

To import these components, use the following syntax:

```javascript
import ResponsiveImage from "flatlayer-sdk/svelte/ResponsiveImage";
import Markdown from "flatlayer-sdk/svelte/Markdown";
```

## Next Steps

For detailed information on each component and advanced usage, please refer to the following guides:

- [ResponsiveImage Component](./responsive-image.md)
- [Markdown Component](./markdown.md)
- [Server-Side Data Fetching](./data-fetching.md)
- [Best Practices and Error Handling](./error-handling.md)