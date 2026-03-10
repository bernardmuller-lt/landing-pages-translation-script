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

## Translation Parsing

After fetching a page, you can extract all translatable text strings into a key-value format for translation.

### Usage

```bash
npm run parse -- <slug>
```

### Examples

Parse the home page:
```bash
npm run parse -- home
```

Parse the support page:
```bash
npm run parse -- support
```

The script will:
1. Read the fetched JSON file from `output/[slug]-en.json`
2. Extract all user-facing text strings
3. Generate path-based keys (e.g., `sections[0].title`, `seo.description`)
4. Save the output to `output/translations/[slug].json`

### Translation Output

Each run creates a translation file in `output/translations/`:

```
output/
├── translations/
│   ├── home.json
│   ├── support.json
│   └── onboarding.json
└── home-en.json
```

**Example translation file** (`output/translations/home.json`):

```json
{
  "seo.description": "Get expert AI-driven answers, powered by GPT-4o",
  "seo.title": "AI Chat - Get Real-Time AI Answers",
  "sections[0].cta.aria_label": "Start using AI Chat now",
  "sections[0].cta.text": "Get Started",
  "sections[0].description": "Get expert AI-driven answers, powered by GPT-4o, instantly",
  "sections[0].title": "Get Real-Time",
  "sections[1].items[0].author": "Tech Professional",
  "sections[1].items[0].description": "This platform seamlessly integrates...",
  "sections[1].items[0].title": "Smart Writing Tool",
  "sections[1].title": "Your gateway to smarter conversations"
}
```

### Path-Based Keys

Keys use JSON path notation to indicate exactly where each string appears in the data:

- `seo.title` - Title in the SEO object
- `sections[0].title` - Title of the first section
- `sections[1].items[3].description` - Description of the 4th item in the 2nd section
- `sections[2].cta.text` - Button text in the 3rd section

This approach:
- Avoids key collisions when the same text appears multiple times
- Makes it clear where translations should be applied
- Enables programmatic re-injection of translations

### What Gets Extracted

The parser extracts user-facing text from these fields:
- `title`, `description`, `text`, `content`
- `heading`, `subtitle`, `author`
- `alt`, `aria_label` (accessibility text)
- `pricePerDay`, `duration`, `fullPrice` (pricing text)

**Excluded fields** (not extracted):
- Technical fields (IDs, timestamps, component names)
- URLs and file paths
- Icon identifiers
- Boolean and numeric values
- Tracking/analytics fields

## Applying Translations

Once you have translated the key-value file, you can apply the translations back to the original structure and prepare it for API submission.

### Usage

```bash
npm run apply -- <locale> <path/to/kv-file>
```

### Examples

Apply German translations:
```bash
npm run apply -- de output/translations/home_de.json
```

Apply French translations:
```bash
npm run apply -- fr output/translations/support_fr.json
```

The script will:
1. Extract the slug from the KV filename (e.g., `home_de.json` → `home`)
2. Read the source page from `output/[slug]-en.json`
3. Apply all translations from the KV file
4. Strip IDs from non-media objects (keeps only media asset IDs)
5. Update the locale to the target locale
6. Format in API-ready structure (matches `post-data.json` format)
7. Save to `output/prepared/[slug]-[locale].json`

### Prepared Output

Files are saved in `output/prepared/` ready for API submission:

```
output/
├── prepared/
│   ├── home-de.json      # German version
│   ├── home-fr.json      # French version
│   └── support-es.json   # Spanish version
├── translations/
│   ├── home.json
│   ├── home_de.json
│   └── support_es.json
└── home-en.json
```

**Example prepared file** (`output/prepared/home-de.json`):

```json
{
  "data": {
    "environment": "production",
    "identifier": "ai-chat",
    "slug": "home",
    "locale": "de",
    "seo": {
      "title": "KI-Chat - Erhalten Sie KI-Antworten in Echtzeit",
      "description": "Erleben Sie KI-gestützte Gespräche..."
    },
    "events": {
      "viewPageEventName": "view_landing",
      "landing_folder": "/",
      "landing_parameter": null
    },
    "sections": [
      {
        "__component": "ai-chat.hero-section",
        "fe_component": "Hero",
        "title": "Erhalten Sie Echtzeit-Antworten",
        "description": "Sofortige KI-Antworten mit GPT-4o",
        "cta": {
          "href": "https://...",
          "text": "Jetzt starten",
          "aria_label": "Jetzt starten",
          "icon": "arrow-right"
        },
        "media": {...}
      }
    ]
  }
}
```

### Complete Workflow

Here's the full workflow from fetching to API-ready translation:

```bash
# Step 1: Fetch the English page
npm run fetch -- home

# Step 2: Extract translatable strings
npm run parse -- home

# Step 3: Translate the JSON file
# Copy output/translations/home.json → home_de.json
# Translate all values to German

# Step 4: Apply translations and prepare for API
npm run apply -- de output/translations/home_de.json

# Result: output/prepared/home-de.json is ready for API submission!
```

### API Structure

The prepared files match the structure expected by the Strapi API (see `src/lib/data/post-data.json` for reference):

- Outer `"data"` wrapper
- Top-level fields: `environment`, `identifier`, `slug`, `locale`
- Content fields: `seo`, `events`, `sections`
- All media, CTAs, and nested structures preserved
- Only text fields are translated

### Data Cleanup

When preparing translations for upload, the script automatically cleans the data to prevent conflicts with existing content in the CMS.

**IDs that get stripped:**
- Section IDs (`sections[0].id`)
- SEO object IDs (`seo.id`)
- CTA IDs (`sections[0].cta.id`)
- Component IDs in nested structures

**IDs that get preserved:**
- Media object IDs (`media.id`, `media.dark.id`, `media.light.id`)
- Any IDs within objects that have media characteristics (hash, ext, mime, formats fields)

**Fields that get removed:**
- `wide` - Removed from all objects throughout the structure

**Why this matters:**
- **Component IDs** should NOT be included - Strapi will generate new IDs for the new locale
- **Media IDs** SHOULD be included - they reference existing media assets that are shared across locales
- **Excluded fields** like `wide` should not be sent in the API payload

This ensures that when you POST a new locale, Strapi creates new content entries while correctly referencing existing media assets.

## Uploading Translations

After preparing the translated file, you can upload it to the CMS.

### Setup

First, add your upload API credentials to the `.env` file:

```env
# Upload API Configuration
UPLOAD_API_URL=https://your-upload-endpoint.com/api
UPLOAD_API_KEY=your_upload_api_key_here
```

### Usage

```bash
npm run upload -- <path/to/prepared-file>
```

### Examples

Upload German translation:
```bash
npm run upload -- output/prepared/home-de.json
```

Upload French translation:
```bash
npm run upload -- output/prepared/support-fr.json
```

The script will:
1. Validate the upload API credentials are set
2. Read and validate the prepared file
3. Upload the content to the CMS via POST request
4. Report success or display error details

### Upload Output

```
╔════════════════════════════════════════════════════════╗
║   CMS Upload                                           ║
╚════════════════════════════════════════════════════════╝

📂 Reading: output/prepared/home-de.json

Validating payload...
  ✓ Valid payload structure
  ✓ Slug: home
  ✓ Locale: de
  ✓ Environment: production
  ✓ Sections: 6

Uploading to CMS...
  ✓ Upload successful!

╔════════════════════════════════════════════════════════╗
║   Summary                                              ║
╚════════════════════════════════════════════════════════╝
  Page: home
  Locale: de
  Identifier: ai-chat
  Status: ✅ Uploaded

✅ Done!
```

### Complete End-to-End Workflow

Here's the full workflow from English content to live translated page:

```bash
# 1. Fetch the English page from CMS
npm run fetch -- home
# → output/home-en.json

# 2. Extract translatable strings to KV format
npm run parse -- home
# → output/translations/home.json

# 3. Translate the strings
# Copy home.json to home_de.json and translate all values
# (manually or using a translation API/service)

# 4. Apply translations and prepare API payload
npm run apply -- de output/translations/home_de.json
# → output/prepared/home-de.json

# 5. Upload to CMS
npm run upload -- output/prepared/home-de.json
# → German page now live in CMS!
```

### Validation

The upload script validates the payload before sending:
- Checks required fields exist (`environment`, `identifier`, `slug`, `locale`)
- Validates structure matches API schema
- Ensures `seo`, `events`, and `sections` are present
- Reports which validations fail if payload is invalid

### Error Handling

If upload fails, the script will:
- Display the error message
- Show full error details from the API
- Exit with error code 1

Common errors:
- **Missing credentials**: Set `UPLOAD_API_URL` and `UPLOAD_API_KEY` in `.env`
- **File not found**: Check the path to the prepared file
- **Invalid payload**: Re-run `npm run apply` to regenerate
- **API errors**: Check API key permissions and endpoint URL

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

### Parse Error: Input file not found

When running `npm run parse -- <slug>`, if you get an error that the input file is not found:
```bash
npm run parse -- home
# Error: Input file not found: output/home-en.json
```

This means you need to fetch the page first:
```bash
npm run fetch -- home
npm run parse -- home
```

### Parse Warning: No translatable strings found

If the parser completes but reports 0 strings extracted, this could mean:
- The page data structure is different than expected
- All text fields are empty
- The page only contains non-translatable content (images, videos, etc.)

Check the source JSON file to verify it contains text content.

## Related Projects

This script is based on code from the [chatai-www](../chatai-www) project, which uses these same types and HTTP functions for fetching content during the build process.

## License

ISC
