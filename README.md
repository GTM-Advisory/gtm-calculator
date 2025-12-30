# GTM Budget Calculator

An interactive tool to calculate and optimize go-to-market budget allocation across different channels. Perfect for B2B SaaS founders and marketing leaders who want to maximize pipeline impact.

## Features

- 💰 Real-time budget allocation visualization
- 📊 12-month pipeline impact calculations (meetings, opportunities, deals, revenue)
- 🎯 Multiple budget tiers ($20K, $30K, $40K, $50K)
- ⚙️ Flexible strategy selection (Agency vs. Internal resources)
- 📈 ROI and 3-year LTV calculations
- 🔄 Reset to defaults at any time
- 📱 Fully responsive design

## How to Use

1. **Set Your Metrics** - Adjust ACV, Sales Cycle, Qualification Rate, and Close Rate in the left panel
2. **Choose Your Budget** - Select your monthly budget using quick-select buttons ($20K, $30K, $40K, $50K)
3. **Select Strategies** - Choose between Agency or Internal Resource for Paid Media and Outreach
4. **Define Team Size** - Specify the number of SDR/Sales profiles for your outreach
5. **Customize Allocation** - Use sliders to adjust budget distribution across channels
6. **Review Impact** - See real-time 12-month projections including meetings, opportunities, deals, and revenue

## Budget Allocation Categories

- **LinkedIn Ads** - Paid advertising and lead nurturing
- **Content** - Blog posts, whitepapers, case studies, organic content
- **Agency/Manager Fees** - Third-party management or internal salary for paid media
- **Website/CRM/Tools** - Software subscriptions and infrastructure
- **Quarterly Webinar** - Webinar hosting, promotion, and execution
- **Outreach** - Direct LinkedIn/email outreach via agency or internal SDRs
- **Buffer/Testing** - Experimental spend and contingency budget

## Key Insights Included

The calculator provides recommendations for:
- Cost per meeting by channel
- Best strategy combinations
- Budget allocation recommendations by tier
- 12-month and 3-year ROI projections

## Technical Details

- Built with React 18 and Tailwind CSS
- No backend required - runs entirely in your browser
- Lucide icons for UI elements
- Responsive grid layout for desktop and mobile

## Getting Started

Simply open `index.html` in your browser or deploy to GitHub Pages for sharing as a lead magnet.

## Customization

All calculations and default allocations are configured in `app.js`. You can modify:
- Default ACV and conversion rates
- Budget tier thresholds
- Channel allocation defaults
- Cost per meeting estimates
- Team size recommendations
