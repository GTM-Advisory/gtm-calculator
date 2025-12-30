'use strict';

function GTMCalculator() {
  const [acv, setAcv] = React.useState(25000);
  const [salesCycle, setSalesCycle] = React.useState(90);
  const [budget, setBudget] = React.useState(30000);
  const [closeRate, setCloseRate] = React.useState(20);
  const [qualificationRate, setQualificationRate] = React.useState(20);
  const [paidMediaStrategy, setPaidMediaStrategy] = React.useState('agency');
  const [outreachStrategy, setOutreachStrategy] = React.useState('agency');
  const [outreachProfiles, setOutreachProfiles] = React.useState(1);

  const formatCurrency = (num) => `$${num.toLocaleString('en-US')}`;

  const getBudgetTier = (budgetValue) => {
    const tiers = [20000, 30000, 40000, 50000];
    return tiers.reduce((prev, curr) =>
      Math.abs(curr - budgetValue) < Math.abs(prev - budgetValue) ? curr : prev
    );
  };

  const tierBudget = getBudgetTier(budget);
  
  const getDefaultAllocations = () => {
    const baseAllocations = {
      20000: { 'LinkedIn Ads': 4500, 'Content': 3000, 'SEO Agency Fees': 2500, 'Website/CRM/Tools': 1000, 'Quarterly Webinar': 1000, 'Buffer/Testing': 0 },
      30000: { 'LinkedIn Ads': 8000, 'Content': 5000, 'SEO Agency Fees': 2500, 'Website/CRM/Tools': 2000, 'Quarterly Webinar': 1500, 'Buffer/Testing': 3000 },
      40000: { 'LinkedIn Ads': 12000, 'Content': 6000, 'SEO Agency Fees': 2500, 'Website/CRM/Tools': 2500, 'Quarterly Webinar': 3250, 'Agency Fees (Paid + Content)': 2500, 'Agency Outreach': 8800, 'Buffer/Testing': 2450 },
      50000: { 'LinkedIn Ads': 15000, 'Content': 6500, 'SEO Agency Fees': 2500, 'Website/CRM/Tools': 2500, 'Quarterly Webinar': 3250, 'Agency Fees (Paid + Content)': 2500, 'Agency Outreach': 12100, 'Buffer/Testing': 5650 }
    };

    const allocations = {};
    for (const tier in baseAllocations) {
      allocations[tier] = { ...baseAllocations[tier] };
      
      if (paidMediaStrategy === 'agency') {
        const linkedinBudget = allocations[tier]['LinkedIn Ads'];
        const agencyFee = Math.max(2500, Math.round(linkedinBudget * 0.15));
        allocations[tier]['Agency Fees (Paid + Content)'] = agencyFee;
      } else {
        delete allocations[tier]['Agency Fees (Paid + Content)'];
        allocations[tier]['Growth Manager (Paid Media)'] = 12500;
      }
      
      if (outreachStrategy === 'agency') {
        const baseCost = 5500;
        allocations[tier]['Agency Outreach'] = Math.round(baseCost + ((outreachProfiles - 1) * baseCost * 0.6));
        delete allocations[tier]['Internal Outreach (Salary + Tools)'];
      } else {
        delete allocations[tier]['Agency Outreach'];
        const baseCost = 7500;
        allocations[tier]['Internal Outreach (Salary + Tools)'] = Math.round(baseCost + ((outreachProfiles - 1) * baseCost * 0.9));
      }
    }
    return allocations;
  };

  const [allocationPercentages, setAllocationPercentages] = React.useState(() => {
    const defaults = getDefaultAllocations()[tierBudget];
    return Object.keys(defaults).reduce((acc, channel) => {
      acc[channel] = (defaults[channel] / tierBudget) * 100;
      return acc;
    }, {});
  });

  React.useEffect(() => {
    const defaults = getDefaultAllocations()[tierBudget];
    setAllocationPercentages(
      Object.keys(defaults).reduce((acc, channel) => {
        acc[channel] = (defaults[channel] / tierBudget) * 100;
        return acc;
      }, {})
    );
  }, [paidMediaStrategy, outreachStrategy, outreachProfiles, budget]);

  const handleQuickBudget = (amount) => {
    setBudget(amount);
    const profiles = amount >= 45000 ? 3 : amount >= 35000 ? 2 : 1;
    setOutreachProfiles(profiles);
  };

  const resetAllocation = () => {
    setAcv(25000);
    setSalesCycle(90);
    setBudget(30000);
    setCloseRate(20);
    setQualificationRate(18);
    setPaidMediaStrategy('agency');
    setOutreachStrategy('agency');
    setOutreachProfiles(1);
  };

  const customAllocation = React.useMemo(() => {
    return Object.keys(allocationPercentages).reduce((acc, channel) => {
      acc[channel] = Math.round((allocationPercentages[channel] / 100) * budget);
      return acc;
    }, {});
  }, [allocationPercentages, budget]);

  const allocationTotal = Object.values(customAllocation).reduce((a, b) => a + b, 0);
  const budgetDifference = allocationTotal - budget;

  const calculations = React.useMemo(() => {
    let linkedinAdsMeetings = 1, contentMeetings = 1.5, baseOutreachMeetings = 6, webinarMeetings = 2;
    
    if (budget >= 35000 && budget < 45000) {
      linkedinAdsMeetings = 2; contentMeetings = 3; baseOutreachMeetings = outreachStrategy === 'agency' ? 10.5 : 7; webinarMeetings = 2;
    } else if (budget >= 45000) {
      linkedinAdsMeetings = 2; contentMeetings = 3.5; baseOutreachMeetings = outreachStrategy === 'agency' ? 10.5 : 7; webinarMeetings = 2.5;
    }

    const outreachMedianCost = outreachStrategy === 'agency' ? 850 : 1955;
    const baseCost = outreachStrategy === 'agency' ? 5500 : 7500;
    const outreachMeetings = (baseCost / outreachMedianCost) + ((outreachProfiles - 1) * ((outreachStrategy === 'agency' ? baseCost * 0.6 : baseCost * 0.9) / outreachMedianCost));

    const totalMeetingsPerMonth = linkedinAdsMeetings + contentMeetings + outreachMeetings + webinarMeetings;
    const opportunitiesPerMonth = (totalMeetingsPerMonth * qualificationRate) / 100;
    const closedDealsPerMonth = (opportunitiesPerMonth * closeRate) / 100;
    const meetings12m = Math.round(totalMeetingsPerMonth * 12);
    const opportunities12m = Math.round((meetings12m * qualificationRate) / 100);
    const deals12m = Math.round((opportunities12m * closeRate) / 100);
    const revenue12m = deals12m * acv;

    const linkedinAdsBudget = customAllocation['LinkedIn Ads'] || 0;
    const linkedinAdsMeetingsActual = linkedinAdsBudget > 0 ? Math.round((linkedinAdsBudget / 7000) * 10) / 10 : 0;
    
    const contentBudget = customAllocation['Content'] || 0;
    const contentMeetingsActual = contentBudget > 0 ? Math.round((contentBudget / 3750) * 10) / 10 : 0;
    
    const webinarBudget = customAllocation['Quarterly Webinar'] || 0;
    const webinarMeetingsActual = webinarBudget > 0 ? Math.round((webinarBudget / 750) * 10) / 10 : 0;
    
    const outreachBudget = customAllocation['Agency Outreach'] || customAllocation['Internal Outreach (Salary + Tools)'] || 0;
    const outreachMeetingsCost = outreachStrategy === 'agency' ? 850 : 1955;
    const outreachMeetingsActual = outreachBudget > 0 ? Math.round((outreachBudget / outreachMeetingsCost) * 10) / 10 : 0;

    return { 
      meetings12m, 
      opportunities12m, 
      deals12m, 
      revenue12m, 
      monthlyBurn: budget,
      linkedinAdsMeetingsActual,
      contentMeetingsActual,
      webinarMeetingsActual,
      outreachMeetingsActual,
      outreachMeetingsCost
    };
  }, [acv, closeRate, qualificationRate, outreachStrategy, outreachProfiles, budget, customAllocation]);

  const roiValue = ((((Math.round(calculations.deals12m / 12) * acv * 3) - (calculations.monthlyBurn * 12)) / (calculations.monthlyBurn * 12)) * 100);

  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8' },
    React.createElement('div', { className: 'max-w-7xl mx-auto' },
      React.createElement('div', { className: 'mb-6' },
        React.createElement('h1', { className: 'text-3xl font-bold text-slate-900 mb-1' }, 'GTM Budget Calculator'),
        React.createElement('p', { className: 'text-sm text-slate-600 mb-2' }, 'Adjust your budget allocation and see real-time impact on pipeline'),
        React.createElement('p', { className: 'text-xs text-slate-700 italic' }, 'Recommended Strategy: Combine Webinar + Agency/SDR Outreach for direct pipeline generation while maintaining LinkedIn Ads + Content for long-term brand building and lead nurturing.')
      ),
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-4 gap-8' },
        React.createElement('div', { className: 'lg:col-span-1' },
          React.createElement('div', { className: 'bg-white rounded-xl shadow-lg p-6' },
            React.createElement('h2', { className: 'text-xl font-semibold text-slate-900 mb-6' }, 'Your Inputs'),
            React.createElement('div', { className: 'mb-4 flex flex-col gap-3' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-2' }, 'ACV'),
                React.createElement('input', { type: 'number', value: acv, onChange: (e) => setAcv(Number(e.target.value)), className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm' })
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-2' }, 'Sales Cycle (days)'),
                React.createElement('input', { type: 'number', value: salesCycle, onChange: (e) => setSalesCycle(Number(e.target.value)), className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm' })
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-2' }, 'Meeting > Opp (%)'),
                React.createElement('input', { type: 'number', value: qualificationRate, onChange: (e) => setQualificationRate(Number(e.target.value)), className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm' })
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-2' }, 'Close Rate (%)'),
                React.createElement('input', { type: 'number', value: closeRate, onChange: (e) => setCloseRate(Number(e.target.value)), className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm' })
              )
            ),
            React.createElement('div', { className: 'mb-6' },
              React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-2' }, 'Monthly Budget'),
              React.createElement('div', { className: 'flex gap-2' },
                [20000, 30000, 40000, 50000].map(amount =>
                  React.createElement('button', {
                    key: amount,
                    onClick: () => handleQuickBudget(amount),
                    className: `flex-1 py-2 rounded-lg font-medium text-sm ${budget === amount ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`
                  }, `$${amount / 1000}K`)
                )
              )
            ),
            React.createElement('button', { onClick: resetAllocation, className: 'w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium' }, 'Reset')
          )
        ),
        React.createElement('div', { className: 'lg:col-span-3' },
          React.createElement('div', { className: 'bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200 mb-8' },
            React.createElement('h3', { className: 'text-lg font-semibold text-slate-900 mb-4' }, '12-Month Impact'),
            React.createElement('p', { className: 'text-xs text-slate-600 italic mb-3' }, 'Includes 3-month setup & optimization phase: Month 1 (0%), Month 2 (25%), Month 3 (75%), Months 4-12 (100%)'),
            React.createElement('div', { className: 'grid grid-cols-4 gap-3' },
              React.createElement('div', { className: 'bg-white rounded p-3 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium' }, 'Meetings'),
                React.createElement('p', { className: 'text-2xl font-bold text-blue-600' }, Math.round(calculations.meetings12m / 12))
              ),
              React.createElement('div', { className: 'bg-white rounded p-3 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium' }, 'Opps'),
                React.createElement('p', { className: 'text-2xl font-bold text-emerald-600' }, Math.round(calculations.opportunities12m / 12))
              ),
              React.createElement('div', { className: 'bg-white rounded p-3 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium' }, 'Deals'),
                React.createElement('p', { className: 'text-2xl font-bold text-purple-600' }, Math.round(calculations.deals12m / 12))
              ),
              React.createElement('div', { className: 'bg-white rounded p-3 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium' }, 'Revenue'),
                React.createElement('p', { className: 'text-lg font-bold text-amber-600' }, formatCurrency(Math.round(calculations.deals12m / 12) * acv))
              )
            ),
            React.createElement('div', { className: 'mt-4 pt-4 border-t border-blue-200 grid grid-cols-3 gap-3 text-center text-sm' },
              React.createElement('div', null,
                React.createElement('p', { className: 'text-slate-600' }, '12mo Spend'),
                React.createElement('p', { className: 'font-bold text-slate-900' }, formatCurrency(calculations.monthlyBurn * 12))
              ),
              React.createElement('div', null,
                React.createElement('p', { className: 'text-slate-600' }, '3yr LTV'),
                React.createElement('p', { className: 'font-bold text-green-600' }, formatCurrency(Math.round(calculations.deals12m / 12) * acv * 3))
              ),
              React.createElement('div', null,
                React.createElement('p', { className: 'text-slate-600' }, 'ROI'),
                React.createElement('p', { className: `font-bold ${roiValue >= 0 ? 'text-green-600' : 'text-red-600'}` }, roiValue >= 0 ? `${roiValue.toFixed(0)}%` : `(${Math.abs(roiValue).toFixed(0)}%)`)
              )
            )
          ),
          React.createElement('div', { className: 'bg-white rounded-xl shadow-lg p-6 mb-8' },
            React.createElement('h3', { className: 'text-lg font-semibold text-slate-900 mb-4' }, `Budget Allocation (${formatCurrency(allocationTotal)}/month)`),
            React.createElement('div', { className: 'grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-200' },
              React.createElement('div', null,
                React.createElement('p', { className: 'text-sm font-medium text-slate-700 mb-3' }, 'Paid Media Strategy'),
                React.createElement('div', { className: 'space-y-2' },
                  React.createElement('button', {
                    onClick: () => setPaidMediaStrategy('agency'),
                    className: `w-full p-3 rounded-lg text-sm font-medium transition border-2 ${paidMediaStrategy === 'agency' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`
                  },
                    React.createElement('div', { className: 'font-semibold' }, 'Agency'),
                    React.createElement('div', { className: 'text-xs mt-1' }, '$2,500 base + 15% of LinkedIn Ads')
                  ),
                  React.createElement('button', {
                    onClick: () => setPaidMediaStrategy('internal'),
                    className: `w-full p-3 rounded-lg text-sm font-medium transition border-2 ${paidMediaStrategy === 'internal' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`
                  },
                    React.createElement('div', { className: 'font-semibold' }, 'Internal Resource'),
                    React.createElement('div', { className: 'text-xs mt-1' }, '$12,500/month (Salary + Tools)')
                  )
                )
              ),
              React.createElement('div', null,
                React.createElement('p', { className: 'text-sm font-medium text-slate-700 mb-3' }, 'Outreach Strategy'),
                React.createElement('div', { className: 'space-y-2' },
                  React.createElement('button', {
                    onClick: () => setOutreachStrategy('agency'),
                    className: `w-full p-3 rounded-lg text-sm font-medium transition border-2 ${outreachStrategy === 'agency' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`
                  },
                    React.createElement('div', { className: 'font-semibold' }, 'Agency'),
                    React.createElement('div', { className: 'text-xs mt-1' }, '$5,500/month + $3,300/month per profile')
                  ),
                  React.createElement('button', {
                    onClick: () => setOutreachStrategy('internal'),
                    className: `w-full p-3 rounded-lg text-sm font-medium transition border-2 ${outreachStrategy === 'internal' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`
                  },
                    React.createElement('div', { className: 'font-semibold' }, 'Internal Resource'),
                    React.createElement('div', { className: 'text-xs mt-1' }, '$7,500/month + $6,750/month per profile')
                  )
                )
              )
            ),
            React.createElement('div', { className: 'mb-4' },
              React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-2' }, 'SDR Profiles'),
              React.createElement('input', { type: 'number', value: outreachProfiles, onChange: (e) => setOutreachProfiles(Math.max(1, Number(e.target.value))), min: '1', className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm' }),
              React.createElement('p', { className: 'text-xs text-slate-500 mt-1' },
                outreachStrategy === 'agency' 
                  ? '+60% per additional profile ($3,300/month)'
                  : '+90% per additional profile ($6,750/month)'
              )
            ),
            budgetDifference !== 0 && React.createElement('div', { className: `mb-4 p-3 rounded-lg text-sm ${budgetDifference > 0 ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}` },
              budgetDifference > 0 ? `Over budget by ${formatCurrency(budgetDifference)}` : `Under budget by ${formatCurrency(Math.abs(budgetDifference))}`
            ),
            React.createElement('div', { className: 'space-y-2' },
              Object.keys(customAllocation)
                .sort((a, b) => customAllocation[b] - customAllocation[a])
                .map((channel) =>
                  React.createElement('div', { key: channel },
                    React.createElement('div', { className: 'flex justify-between text-sm mb-1' },
                      React.createElement('span', { className: 'font-medium text-slate-700' }, channel),
                      React.createElement('span', { className: 'text-slate-900 font-semibold' }, `${formatCurrency(customAllocation[channel])} (${allocationPercentages[channel]?.toFixed(1)}%)`)
                    ),
                    React.createElement('input', {
                      type: 'range',
                      min: '0',
                      max: '100',
                      value: allocationPercentages[channel] || 0,
                      onChange: (e) => {
                        const newPercentages = { ...allocationPercentages };
                        newPercentages[channel] = Number(e.target.value);
                        setAllocationPercentages(newPercentages);
                      },
                      className: 'w-full h-2 bg-slate-200 rounded-lg'
                    })
                  )
                )
            )
          ),
          React.createElement('div', { className: 'bg-white rounded-xl shadow-lg p-6 mb-8' },
            React.createElement('h3', { className: 'text-lg font-semibold text-slate-900 mb-4' }, 'Meetings by Channel (Monthly)'),
            React.createElement('div', { className: 'grid grid-cols-4 gap-3 mb-6 pb-6 border-b border-slate-200' },
              React.createElement('div', { className: 'bg-slate-50 rounded p-3 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium mb-1' }, 'LinkedIn Ads'),
                React.createElement('p', { className: 'text-2xl font-bold text-blue-600' }, calculations.linkedinAdsMeetingsActual),
                React.createElement('p', { className: 'text-xs text-slate-500 mt-1' }, `${formatCurrency(customAllocation['LinkedIn Ads'] || 0)}`)
              ),
              React.createElement('div', { className: 'bg-slate-50 rounded p-3 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium mb-1' }, 'Content/Organic'),
                React.createElement('p', { className: 'text-2xl font-bold text-emerald-600' }, calculations.contentMeetingsActual),
                React.createElement('p', { className: 'text-xs text-slate-500 mt-1' }, `${formatCurrency(customAllocation['Content'] || 0)}`)
              ),
              React.createElement('div', { className: 'bg-slate-50 rounded p-3 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium mb-1' }, 'Outreach'),
                React.createElement('p', { className: 'text-2xl font-bold text-purple-600' }, calculations.outreachMeetingsActual),
                React.createElement('p', { className: 'text-xs text-slate-500 mt-1' }, `${formatCurrency(customAllocation['Agency Outreach'] || customAllocation['Internal Outreach (Salary + Tools)'] || 0)}`)
              ),
              React.createElement('div', { className: 'bg-slate-50 rounded p-3 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium mb-1' }, 'Webinar'),
                React.createElement('p', { className: 'text-2xl font-bold text-amber-600' }, calculations.webinarMeetingsActual),
                React.createElement('p', { className: 'text-xs text-slate-500 mt-1' }, `${formatCurrency(customAllocation['Quarterly Webinar'] || 0)}`)
              )
            ),
            React.createElement('h3', { className: 'text-lg font-semibold text-slate-900 mb-4' }, 'Summary: Cost per Meeting by Channel'),
            React.createElement('div', { className: 'space-y-3 mb-6' },
              React.createElement('div', { className: 'flex justify-between items-center p-3 bg-slate-50 rounded-lg' },
                React.createElement('span', { className: 'text-slate-700 font-medium' }, 'Quarterly Webinar'),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('p', { className: 'text-slate-900 font-semibold' }, '$750'),
                  React.createElement('p', { className: 'text-xs text-slate-500' }, '($500-$1,000)')
                ),
                React.createElement('span', { className: 'text-xs text-green-600 font-semibold' }, 'Most Efficient')
              ),
              React.createElement('div', { className: 'flex justify-between items-center p-3 bg-slate-50 rounded-lg' },
                React.createElement('span', { className: 'text-slate-700 font-medium' }, 'Agency Outreach'),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('p', { className: 'text-slate-900 font-semibold' }, '$850'),
                  React.createElement('p', { className: 'text-xs text-slate-500' }, 'Direct & predictable')
                )
              ),
              React.createElement('div', { className: 'flex justify-between items-center p-3 bg-slate-50 rounded-lg' },
                React.createElement('span', { className: 'text-slate-700 font-medium' }, 'LinkedIn Ads'),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('p', { className: 'text-slate-900 font-semibold' }, '$7,000'),
                  React.createElement('p', { className: 'text-xs text-slate-500' }, 'Nurture & brand')
                )
              ),
              React.createElement('div', { className: 'flex justify-between items-center p-3 bg-slate-50 rounded-lg' },
                React.createElement('span', { className: 'text-slate-700 font-medium' }, 'Content/Organic'),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('p', { className: 'text-slate-900 font-semibold' }, '$3,750'),
                  React.createElement('p', { className: 'text-xs text-slate-500' }, 'Long-term ROI')
                )
              ),
              React.createElement('div', { className: 'flex justify-between items-center p-3 bg-slate-50 rounded-lg' },
                React.createElement('span', { className: 'text-slate-700 font-medium' }, 'Internal SDR Outreach'),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('p', { className: 'text-slate-900 font-semibold' }, '$1,955'),
                  React.createElement('p', { className: 'text-xs text-slate-500' }, 'Full control & scale')
                )
              )
            ),
            React.createElement('div', { className: 'border-t border-slate-200 pt-4 space-y-4' },
              React.createElement('div', null,
                React.createElement('p', { className: 'text-sm font-semibold text-slate-900 mb-2' }, 'Key Insights:'),
                React.createElement('ul', { className: 'space-y-2 text-sm text-slate-700' },
                  React.createElement('li', null, '• ', React.createElement('span', { className: 'font-semibold' }, 'Quarterly Webinar'), ' delivers the lowest cost per meeting at $750, making it the most efficient channel for consistent, high-quality pipeline generation'),
                  React.createElement('li', null, '• ', React.createElement('span', { className: 'font-semibold' }, 'Agency Outreach'), ' is a close second at $850 median with predictable volume and direct control over messaging'),
                  React.createElement('li', null, '• ', React.createElement('span', { className: 'font-semibold' }, 'Internal SDR Outreach'), ' costs $1,955/meeting but provides full control and maximum personalization for enterprise accounts'),
                  React.createElement('li', null, '• ', React.createElement('span', { className: 'font-semibold' }, 'LinkedIn Ads'), ' at $7,000/meeting serves as a nurture and brand-building channel rather than direct pipeline generation'),
                  React.createElement('li', null, '• ', React.createElement('span', { className: 'font-semibold' }, 'Content/Organic'), ' at $3,750/meeting builds long-term authority and supports the full sales funnel')
                )
              ),
              React.createElement('div', { className: 'pt-4 border-t border-slate-200' },
                React.createElement('p', { className: 'text-sm font-semibold text-slate-900 mb-2' }, 'Recommended Budget Allocation by Tier:'),
                React.createElement('ul', { className: 'space-y-1 text-sm text-slate-700' },
                  React.createElement('li', null, '• ', React.createElement('span', { className: 'font-semibold' }, '$20K:'), ' Foundational GTM with 1 SDR/Agency Outreach profile, webinars, and content optimization'),
                  React.createElement('li', null, '• ', React.createElement('span', { className: 'font-semibold' }, '$30K:'), ' Increased content production, expanded webinar cadence, and buffer for testing new channels'),
                  React.createElement('li', null, '• ', React.createElement('span', { className: 'font-semibold' }, '$40K:'), ' Scale to 2 SDR profiles, increase webinar frequency, strengthen LinkedIn paid presence and organic content'),
                  React.createElement('li', null, '• ', React.createElement('span', { className: 'font-semibold' }, '$50K:'), ' Full SDR team (3 profiles), premium content program, sustained brand building across all channels with experimental budget')
                )
              )
            )
          )
        )
      )
    )
  );
}

const { createRoot } = ReactDOM;
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(GTMCalculator));
