**<h1 align="center">LogPose: Argo Visualization Platform with Tambo AI Orchestration</h1>**

<img width="1840" height="957" alt="logpose" src="https://github.com/user-attachments/assets/d430b1a6-0f94-46c4-95e4-83fd287ce2ed" />

A comprehensive platform for visualizing Argo float data with integrated AI capabilities, developed for Argo related research. Featuring Tambo as the orchestrator agent to control sub-agents for optimized fetching of Argo NetCDF data from various platforms.

### What are Argo Floats?

Argo floats are autonomous profiling instruments that measure temperature, salinity, and other oceanographic parameters. They drift with ocean currents and periodically dive to collect vertical profiles, providing critical data for climate research and ocean monitoring.

## Features

### AI-Powered Multi-Agent System

- **Tambo Orchestrator**: Coordinates specialized sub-agents based on natural language queries
- **Data Fetcher Agent**: Optimized streaming of large NetCDF files with spatial-temporal indexing
- **Spatial Query Agent**: Geographic filtering and trajectory analysis
- **Visualization Agent**: Dynamic component rendering based on user intent
- **Export Agent**: Intelligent data formatting and download management!
- **Temporal Analysis Agent**: Time-series operations and trend detection
<img width="2467" height="1612" alt="logpose2" src="https://github.com/user-attachments/assets/4819f81c-3590-4d3e-9529-6da726b4cb3c" />


### Interactive Visualizations

- **Real-time Argo Float Maps**: Live tracking of float deployments and trajectories
- **Oceanographic Profiles**: Vertical temperature, salinity, and pressure profiles
- **Trajectory Animation**: Time-based path visualization with playback controls
- **Multi-parameter Charts**: Comprehensive data analysis with interactive charts
- **Anomaly Detection**: AI-powered identification of unusual oceanographic patterns
- **Regional Comparison**: Side-by-side analysis of different ocean regions

### Conversational Interface

Query ocean data naturally:

- _"Show me all active floats in the Bay of Bengal from 2023"_
- _"Compare temperature profiles between Arabian Sea and Bay of Bengal"_
- _"Which floats have critical battery levels?"_
- _"Export last 6 months of data for float #2902741 as CSV"_

### Advanced Analytics

- **Time Period Selection**: Flexible temporal filtering with custom date ranges
- **Deployment Year Filtering**: Historical analysis and trend identification
- **Battery Health Monitoring**: Real-time status tracking of float instrumentation
- **Quality Control Visualization**: Data quality flags and validation metrics
- **Multi-float Comparison**: Simultaneous analysis of multiple instruments
- **Data Download**: Export capabilities with format conversion


## Project Structure

```
LogPose/
├── apps/
│   ├── web/         # Frontend application (Next.js) with Tambo integration
│   └── server/      # Backend API (Hono) handling AI orchestration
├── packages/
│   ├── config/     # Monorepo config
│   └── db/         # Drizzel schema
│   └── schema/     # zod schema
│   └── worker/     # Worker to fetch float info
├── Terraform
```
