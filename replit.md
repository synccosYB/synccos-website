# Synccos Website

## Overview
A static website mirror of the Synccos Business Intelligence Platform, imported from an HTTrack website copy.

## Project Structure
- `synccos.com/` - Main website content (HTML, CSS, JS, images)
- `index.html` - HTTrack index page that redirects to main site
- `server.js` - Node.js static file server with contact form API
- `*.gif` - Background images used by HTTrack index

## Running the Project
The website is served via a Node.js static file server on port 5000.

**Workflow:** `node server.js`

## Contact Form
The contact form at /contact sends emails via SendGrid with reCAPTCHA spam protection.

**Environment Variables Required:**
- `SENDGRID_API_KEY` - SendGrid API key (secret)
- `ADMIN_EMAIL` - Email address to receive contact form submissions
- `FROM_EMAIL` - Verified SendGrid sender email address
- `RECAPTCHA_SITE_KEY` - Google reCAPTCHA v2 site key (optional)
- `RECAPTCHA_SECRET_KEY` - Google reCAPTCHA v2 secret key (optional, secret)

**Endpoints:**
- POST /api/contact - Submit contact form
- GET /api/recaptcha-key - Get reCAPTCHA site key for frontend

## SEO Features
- Meta descriptions and improved title tags on all pages
- Open Graph tags for Facebook/LinkedIn sharing
- Twitter Card tags for Twitter previews
- sitemap.xml at /sitemap.xml with all site pages
- robots.txt at /robots.txt for search engine crawlers

## Custom 404 Page
The server displays a branded 404 page (`synccos.com/404.html`) when users navigate to non-existent pages. The 404 page includes the full site header, footer, and navigation matching the rest of the website.

## Product Roadmap Page
A dedicated roadmap page at `/roadmap` showing Synccos product milestones in a vertical timeline layout:
- **Launched:** ConnexaBI, BI Reporting & Analytics, Platform Integrations, Calendar & Scheduling, Check Writer, CRM
- **In Progress:** VoIP System
- **Planned:** Mobile Apps, AI-Powered Insights
- Interactive filter buttons (All, Launched, In Progress, Planned) with smooth animations
- Scroll-triggered fade-in animations for timeline items
- Fully responsive design (stacks vertically on mobile)

## FAQ Page
A dedicated FAQ page at `/faq` with accordion-style expandable questions organized by category:
- **Categories:** Getting Started, Products, Pricing & Billing, Account & Security, Support
- Interactive category filter buttons to show/hide sections
- Smooth expand/collapse animations on each question
- "Still Have Questions?" CTA linking to Contact page
- 20 comprehensive FAQ items covering all Synccos products and services
- Fully responsive design

## Footer Links
Placeholder links for pages not yet built (Blog, Careers, Customers, Documentation, Press) have been removed from the footer across all pages. The footer now only lists pages that exist:
- **Company:** Pricing
- **Resources:** FAQ's
- **Products:** Synccos ConnexaBI, VoIP, Calendar, Check Writer, CRM
- **Legal & Compliance:** Terms Of Service, Privacy Policy, Cookies Policy, Data Processing

## Clean URLs
Server provides clean URL routing:
- /connexabi, /pricing, /voip, /contact, /check-writer, /roadmap, /faq for product pages
- /synccos-privacy-policy, /synccos-terms-of-service, etc. for policy pages

## Deployment
This is a static website that can be deployed using Replit's static hosting feature, serving files from the current directory.
