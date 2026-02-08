# LogPose: Argo Float Visualization Platform with Tambo AI Orchestration

A comprehensive platform for visualizing Argo float data with integrated AI capabilities, developed for Argo related research. Featuring Tambo as the orchestrator agent to control sub-agents for optimized fetching of Argo NetCDF data from various platforms.

### What are Argo Floats?

Argo floats are autonomous profiling instruments that measure temperature, salinity, and other oceanographic parameters. They drift with ocean currents and periodically dive to collect vertical profiles, providing critical data for climate research and ocean monitoring.


## Features

### AI-Powered Multi-Agent System

- **Tambo Orchestrator**: Coordinates specialized sub-agents based on natural language queries
- **Data Fetcher Agent**: Optimized streaming of large NetCDF files with spatial-temporal indexing
- **Spatial Query Agent**: Geographic filtering and trajectory analysis
- **Visualization Agent**: Dynamic component rendering based on user intent
- **Export Agent**: Intelligent data formatting and download management
- **Temporal Analysis Agent**: Time-series operations and trend detection

### Interactive Visualizations

- **Real-time Argo Float Maps**: Live tracking of float deployments and trajectories
- **Oceanographic Profiles**: Vertical temperature, salinity, and pressure profiles
- **Trajectory Animation**: Time-based path visualization with playback controls
- **Multi-parameter Charts**: Comprehensive data analysis with interactive charts
- **Anomaly Detection**: AI-powered identification of unusual oceanographic patterns
- **Regional Comparison**: Side-by-side analysis of different ocean regions

### Conversational Interface

Query ocean data naturally:
- *"Show me all active floats in the Bay of Bengal from 2023"*
- *"Compare temperature profiles between Arabian Sea and Bay of Bengal"*
- *"Which floats have critical battery levels?"*
- *"Export last 6 months of data for float #2902741 as CSV"*

### Advanced Analytics

- **Time Period Selection**: Flexible temporal filtering with custom date ranges
- **Deployment Year Filtering**: Historical analysis and trend identification
- **Battery Health Monitoring**: Real-time status tracking of float instrumentation
- **Quality Control Visualization**: Data quality flags and validation metrics
- **Multi-float Comparison**: Simultaneous analysis of multiple instruments
- **Data Download**: Export capabilities with format conversion

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:

```bash
bun run db:push
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
LogPose/
├── apps/
│   ├── web/         # Frontend application (Next.js) with Tambo integration
│   └── server/      # Backend API (Hono) handling AI orchestration
├── packages/
│   ├── config/     # Monorepo config
│   └── db/         # Drizzel schema
│   └── env/        # env var managment
│   └── schema/     # zod schema
│   └── worker/     # Worker to fetch float info 
├── Terraform       
```