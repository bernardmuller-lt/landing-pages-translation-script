# ChatAI Strapi CMS Content Fetch Script

A Node.js script that fetches page content from the Strapi CMS (used by the chatai-www project) and saves it as JSON files. This script reuses the HTTP functions and TypeScript types from the chatai-www project.

## Features

- Fetches page content from Strapi CMS API
- Supports filtering by environment (production/staging/development)
- Type-safe with TypeScript
- Saves content as JSON files with format: `[slug]-[locale].json`
- Easy to configure and extend

## Prerequisites

- Node.js 18+ (for native fetch API support)
- npm or yarn
- Strapi CMS API access (URL and API token)

## Installation

1. Clone or navigate to this repository:

```bash
cd chatai-script
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

4. Edit the `.env` file and add your Strapi credentials:

```env
CMS_API_URL=https://big-dog-9e75d2515f.strapiapp.com/api
CMS_API_TOKEN=your_api_token_here
```

## Usage

Run the script with a page slug to fetch and save that specific page as a JSON file:

```bash
npm run fetch -- <slug>
```

### Examples

Fetch the home page:
```bash
npm run fetch -- home
```

Fetch the support page:
```bash
npm run fetch -- support
```

Fetch the onboarding page:
```bash
npm run fetch -- onboarding
```

The script will:
1. Connect to the Strapi CMS API
2. Fetch the specified page for the `ai-chat` project
3. Filter by `production` environment and `en` locale
4. Save the page as `[slug]-en.json` in the `output/` directory

**Note:** The `--` after `npm run fetch` is required to pass the slug argument to the script.

### Output

Each run of the script saves one JSON file in the `output/` directory:

```
output/
└── [slug]-en.json  (e.g., home-en.json, support-en.json)
```

Each JSON file contains:

```json
{
  "slug": "home",
  "locale": "en",
  "seo": {
    "title": "...",
    "description": "..."
  },
  "sections": [...],
  "events": {...}
}
```

## Configuration

You can modify the configuration in `src/config.ts`:

- `identifier`: Project identifier (default: 'ai-chat')
- `locale`: Locale to fetch (default: 'en')
- `environment`: Environment filter (default: 'production')
- `outputDir`: Output directory path (default: './output')

## Project Structure

```
chatai-script/
├── src/
│   ├── index.ts                    # Main CLI script
│   ├── config.ts                   # Configuration constants
│   ├── lib/
│   │   ├── strapi/
│   │   │   ├── types.ts            # TypeScript types from chatai-www
│   │   │   └── http/
│   │   │       ├── client.ts       # HTTP client for Strapi API
│   │   │       └── fetchPages.ts   # Page fetching logic
│   │   └── utils/
│   │       └── fileWriter.ts       # JSON file writing utility
├── output/                         # Generated JSON files
├── .env                            # Environment variables (not in git)
├── .env.example                    # Example environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Development

The script uses `tsx` for TypeScript execution without a build step.

Watch mode (automatically reruns on file changes):

```bash
npm run fetch:watch
```

## API Details

### Strapi Endpoint

The script queries the Strapi API with the following parameters:

```
GET /api/pages?locale=en&populate=*&filters[environment][$eq]=production&filters[identifier][$eq]=ai-chat
```

### Authentication

The script uses Bearer token authentication. The token must be set in the `CMS_API_TOKEN` environment variable.

To create an API token in Strapi:
1. Go to Strapi admin panel
2. Navigate to Settings > Global settings > API Tokens
3. Create a new Read-only token
4. Copy the token to your `.env` file

## Troubleshooting

### Error: Missing required argument <slug>

You need to provide a slug argument when running the script. Use:
```bash
npm run fetch -- <slug>
```
See the Usage section for examples.

### Error: CMS_API_URL environment variable is not set

Make sure you have created a `.env` file with the required variables. See the Installation section.

### Warning: Page "[slug]" not found in Strapi CMS

This means the specified page slug doesn't exist or isn't published in Strapi. Check:
- The page exists in Strapi with the exact slug name
- The page is published (not draft)
- The environment filter matches (default: production)
- The locale matches (default: en)
- The identifier matches (default: ai-chat)

### Network errors

Make sure:
- The Strapi API URL is correct
- Your API token is valid
- You have internet connectivity
- The Strapi server is running

## Related Projects

This script is based on code from the [chatai-www](../chatai-www) project, which uses these same types and HTTP functions for fetching content during the build process.

## License

ISC
