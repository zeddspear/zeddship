# Reddit-like Web App

This is a Reddit-like web application built with React and TypeScript, powered by Supabase for PostgreSQL database and user authentication. Users can create posts, comment on posts, and upvote/downvote posts.

## Features

- User authentication using Supabase.
- Post creation and commenting functionality.
- Upvote and downvote system for posts.
- Tailwind CSS for styling.
- Docker support for local development.

## Quick Start

Ensure Docker is running, then clone the repository and install the dependencies:

```bash
git clone https://github.com/zeddspear/zeddship
cd zeddship
npm install
```
Local Development
Install Supabase CLI

To manually install the Supabase CLI and get the CLI binary:

```bash
npm install -D supabase
```
Start Supabase

Make sure Docker is running, then start Supabase in debug mode:

```bash
npx start supabase
```

To stop the Supabase instance, use:

```bash
npx stop supabase
```

Start Development Server

To run the app in development mode:

```bash
npm run dev
```

Production Build

To build the app for production:

```bash
npm run build
```

Tech Stack

-React (with TypeScript)
-Supabase (PostgreSQL, Authentication)
-Tailwind CSS (for styling)
-Docker (for local development)



