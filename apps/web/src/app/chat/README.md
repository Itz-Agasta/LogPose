# LogPose AI Chat Interface

This directory contains the AI-powered chat interface for LogPose, built with [Tambo](https://tambo.co) Generative UI.

## Features

- **Generative UI Components**: The AI dynamically renders appropriate React components based on user queries
- **Real-time Streaming**: Responses stream in real-time with status indicators
- **Data Tools**: Built-in tools for fetching Argo float data from the LogPose API

## Setup

### 1. Get a Tambo API Key

1. Go to [Tambo Console](https://console.tambo.co)
2. Create a new project or select an existing one
3. Generate an API key

### 2. Configure Environment Variables

Add the following to your `.env.local` file in the `apps/web` directory:

```env
NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_api_key_here
```

### 3. Run the Application

```bash
bun run dev
```

Navigate to `http://localhost:3001/chat` to access the chat interface.

## Architecture

### Components

The chat interface uses several generative UI components that Tambo can render:

| Component | Description |
|-----------|-------------|
| `FloatDataCard` | Displays detailed information about a specific Argo float |
| `OceanStatsCard` | Shows aggregated statistics about ocean data |
| `FloatLocationMap` | Renders a mini map with float locations |
| `DataTable` | Displays tabular data with columns and rows |

### Tools

Tambo has access to tools for fetching data:

| Tool | Description |
|------|-------------|
| `get-float-locations` | Fetches all Argo float locations from the database |
| `get-float-details` | Fetches detailed information about a specific float by ID |

### File Structure

```
src/
├── app/chat/
│   └── page.tsx              # Main chat page with TamboProvider
├── components/chat/
│   ├── chat-input.tsx        # Message input component
│   ├── chat-message.tsx      # Individual message renderer
│   ├── message-thread.tsx    # Message list with auto-scroll
│   ├── float-data-card.tsx   # Generative: Float details card
│   ├── ocean-stats-card.tsx  # Generative: Statistics card
│   ├── float-location-map.tsx# Generative: Location map
│   ├── data-table.tsx        # Generative: Data table
│   └── index.ts              # Component exports
└── lib/
    └── tambo.ts              # Tambo configuration (components & tools)
```

## Example Queries

Try these queries to see the generative UI in action:

- "Show me all active floats" - Displays float locations on a map
- "What's the status of the Argo network?" - Shows network statistics
- "Get details for float 12345" - Displays detailed float information
- "List floats in the Pacific Ocean" - Shows a data table

## Customization

### Adding New Components

1. Create your component in `src/components/chat/`
2. Define a Zod schema for the props
3. Register the component in `src/lib/tambo.ts`

```typescript
{
  name: "MyComponent",
  description: "Description of when to use this component",
  component: MyComponent,
  propsSchema: z.object({
    // Define props with descriptions
    prop1: z.string().describe("Description for AI"),
  }),
}
```

### Adding New Tools

1. Define the tool function
2. Create input and output schemas with Zod
3. Register in the `tools` array in `src/lib/tambo.ts`

```typescript
{
  name: "my-tool",
  description: "What the tool does",
  tool: async ({ param1 }) => {
    // Tool implementation
    return result;
  },
  inputSchema: z.object({
    param1: z.string().describe("Parameter description"),
  }),
  outputSchema: z.object({
    // Define output shape
  }),
}
```

## Resources

- [Tambo Documentation](https://docs.tambo.co)
- [Tambo React SDK Reference](https://docs.tambo.co/reference/react-sdk)
- [Generative UI Concepts](https://docs.tambo.co/concepts/generative-interfaces)