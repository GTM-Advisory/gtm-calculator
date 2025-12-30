'use strict';

function GTMCalculator() {
  const [acv, setAcv] = React.useState(25000);
  const [salesCycle, setSalesCycle] = React.useState(90);
  const [budget, setBudget] = React.useState(20000);
  const [closeRate, setCloseRate] = React.useState(25);
  const [qualificationRate, setQualificationRate] = React.useState(25);
  const [paidMediaStrategy, setPaidMediaStrategy] = React.useState('agency');
  const [outreachStrategy, setOutreachStrategy] = React.useState('agency');
  const [outreachProfiles, setOutreachProfiles] = React.useState(1);
  const [editingCostPerMeeting, setEditingCostPerMeeting] = React.useState(false);
  const [customBudgetInput, setCustomBudgetInput] = React.useState('');
  const [customCostPerMeeting, setCustomCostPerMeeting] = React.useState({
    'LinkedIn Ads': 5000,
    'Google Remarketing': 2500,
    'Agency Outreach': 850,
    'Content': 3750,
    'Webinar': 750,
    'Internal SDR Outreach': 1955
  });

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
      20000: { 'LinkedIn Ads': 4500, 'Agency Outreach': 5500, 'Content': 3000, 'SEO Agency Fees': 2500, 'Agency Fees (Paid + Content)': 2500, 'Website/CRM/Tools': 1000, 'Quarterly Webinar': 1000 },
      30000: { 'LinkedIn Ads': 6000, 'Google Remarketing': 1200, 'Agency Outreach': 8800, 'Content': 4000, 'Buffer/Testing': 1500, 'SEO Agency Fees': 2500, 'Agency Fees (Paid + Content)': 2500, 'Website/CRM/Tools': 2000, 'Quarterly Webinar': 1500 },
      40000: { 'LinkedIn Ads': 10000, 'Google Remarketing': 2000, 'Agency Outreach': 10450, 'Content': 6000, 'Buffer/Testing': 2000, 'SEO Agency Fees': 2500, 'Agency Fees (Paid + Content)': 2500, 'Website/CRM/Tools': 2550, 'Quarterly Webinar': 2000 },
      50000: { 'LinkedIn Ads': 12000, 'Google Remarketing': 3000, 'Agency Outreach': 13750, 'Content': 7250, 'Buffer/Testing': 2500, 'SEO Agency Fees': 2500, 'Agency Fees (Paid + Content)': 2500, 'Website/CRM/Tools': 4000, 'Quarterly Webinar': 2500 }
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
        // $5,500 base + $3,300 per additional profile
        if (outreachProfiles === 0) {
          allocations[tier]['Agency Outreach'] = 0;
        } else {
          const scaledCost = Math.round(5500 + ((outreachProfiles - 1) * 3300));
          allocations[tier]['Agency Outreach'] = scaledCost;
        }
        delete allocations[tier]['Internal Outreach (Salary + Tools)'];
      } else {
        delete allocations[tier]['Agency Outreach'];
        // $7,500 base + $6,750 per additional profile
        if (outreachProfiles === 0) {
          allocations[tier]['Internal Outreach (Salary + Tools)'] = 0;
        } else {
          const scaledCost = Math.round(7500 + ((outreachProfiles - 1) * 6750));
          allocations[tier]['Internal Outreach (Salary + Tools)'] = scaledCost;
        }
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
    const profiles = amount >= 50000 ? 3.5 : amount >= 40000 ? 2.5 : amount >= 30000 ? 2 : 1;
    setOutreachProfiles(profiles);
  };

  const resetAllocation = () => {
    setAcv(25000);
    setSalesCycle(90);
    setBudget(20000);
    setCloseRate(25);
    setQualificationRate(25);
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
    // Calculate meetings per channel based on actual budgets and custom costs
    const linkedinAdsBudget = customAllocation['LinkedIn Ads'] || 0;
    const linkedinAdsMeetings = linkedinAdsBudget > 0 ? linkedinAdsBudget / customCostPerMeeting['LinkedIn Ads'] : 0;
    
    const googleRemarketingBudget = customAllocation['Google Remarketing'] || 0;
    const googleRemarketingMeetings = googleRemarketingBudget > 0 ? googleRemarketingBudget / customCostPerMeeting['Google Remarketing'] : 0;
    
    const contentBudget = customAllocation['Content'] || 0;
    const contentMeetings = contentBudget > 0 ? contentBudget / customCostPerMeeting['Content'] : 0;
    
    const webinarBudget = customAllocation['Quarterly Webinar'] || 0;
    const webinarMeetings = webinarBudget > 0 ? webinarBudget / customCostPerMeeting['Webinar'] : 0;
    
    const outreachBudget = customAllocation['Agency Outreach'] || customAllocation['Internal Outreach (Salary + Tools)'] || 0;
    const outreachMeetingsCost = outreachStrategy === 'agency' ? customCostPerMeeting['Agency Outreach'] : customCostPerMeeting['Internal SDR Outreach'];
    const outreachMeetings = outreachBudget > 0 ? outreachBudget / outreachMeetingsCost : 0;

    // Total monthly meetings
    const monthlyMeetings = linkedinAdsMeetings + googleRemarketingMeetings + contentMeetings + webinarMeetings + outreachMeetings;
    
    // Calculate 12-month impact with ramp-up phase
    // Month 1: 0%, Month 2: 25%, Month 3: 75%, Months 4-12: 100%
    const rampupMeetings = (monthlyMeetings * 0) + (monthlyMeetings * 0.25) + (monthlyMeetings * 0.75) + (monthlyMeetings * 1 * 9);
    const meetings12m = Math.round(rampupMeetings);
    
    const opportunities12m = Math.round((meetings12m * qualificationRate) / 100);
    const deals12m = Math.round((opportunities12m * closeRate) / 100);
    const revenue12m = deals12m * acv;

    // For display purposes (rounded to 1 decimal)
    const linkedinAdsMeetingsActual = linkedinAdsBudget > 0 ? Math.round((linkedinAdsBudget / customCostPerMeeting['LinkedIn Ads']) * 10) / 10 : 0;
    const googleRemarketingMeetingsActual = googleRemarketingBudget > 0 ? Math.round((googleRemarketingBudget / customCostPerMeeting['Google Remarketing']) * 10) / 10 : 0;
    const contentMeetingsActual = contentBudget > 0 ? Math.round((contentBudget / customCostPerMeeting['Content']) * 10) / 10 : 0;
    const webinarMeetingsActual = webinarBudget > 0 ? Math.round((webinarBudget / customCostPerMeeting['Webinar']) * 10) / 10 : 0;
    const outreachMeetingsActual = outreachBudget > 0 ? Math.round((outreachBudget / outreachMeetingsCost) * 10) / 10 : 0;
    const totalMonthlyMeetings = Math.round(monthlyMeetings * 10) / 10;

    return { 
      meetings12m, 
      opportunities12m, 
      deals12m, 
      revenue12m, 
      monthlyBurn: budget,
      monthlyMeetings: totalMonthlyMeetings,
      linkedinAdsMeetingsActual,
      googleRemarketingMeetingsActual,
      contentMeetingsActual,
      webinarMeetingsActual,
      outreachMeetingsActual,
      outreachMeetingsCost
    };
  }, [acv, closeRate, qualificationRate, outreachStrategy, outreachProfiles, budget, customAllocation, customCostPerMeeting]);

  const roiValue3yr = ((((calculations.revenue12m * 3) - (calculations.monthlyBurn * 12)) / (calculations.monthlyBurn * 12)) * 100);
  const roi18mo = ((((calculations.revenue12m * 1.5) - (calculations.monthlyBurn * 12)) / (calculations.monthlyBurn * 12)) * 100);

  const getChannelRankings = () => {
    const channels = [
      { name: 'Quarterly Webinar', cost: customCostPerMeeting['Webinar'] },
      { name: 'Google Remarketing', cost: customCostPerMeeting['Google Remarketing'] },
      { name: 'Agency Outreach', cost: customCostPerMeeting['Agency Outreach'] },
      { name: 'Content/Organic', cost: customCostPerMeeting['Content'] },
      { name: 'Internal SDR Outreach', cost: customCostPerMeeting['Internal SDR Outreach'] },
      { name: 'LinkedIn Ads', cost: customCostPerMeeting['LinkedIn Ads'] }
    ];
    return channels.sort((a, b) => a.cost - b.cost);
  };

  const channelRankings = getChannelRankings();

  const generateKeyInsights = () => {
    const insights = [];
    
    insights.push(
      `${channelRankings[0].name} is the most cost-efficient channel at $${channelRankings[0].cost} per meeting, making it the top priority for direct pipeline generation.`
    );
    
    insights.push(
      `${channelRankings[1].name} is the second most efficient at $${channelRankings[1].cost} per meeting, providing a strong secondary pipeline source.`
    );
    
    insights.push(
      `${channelRankings[2].name} at $${channelRankings[2].cost} per meeting offers good efficiency and can be scaled to increase volume.`
    );
    
    insights.push(
      `${channelRankings[3].name} at $${channelRankings[3].cost} per meeting builds long-term authority and supports the full sales funnel with sustained value.`
    );
    
    insights.push(
      `${channelRankings[4].name} at $${channelRankings[4].cost} per meeting requires higher investment but provides personalization and control over messaging.`
    );
    
    insights.push(
      `${channelRankings[5].name} at $${channelRankings[5].cost} per meeting serves as a nurture and brand-building channel rather than direct pipeline generation.`
    );
    
    return insights;
  };

  const keyInsights = generateKeyInsights();

  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8' },
    React.createElement('div', { className: 'max-w-7xl mx-auto' },
      React.createElement('div', { className: 'mb-6' },
        React.createElement('h1', { className: 'text-3xl font-bold text-slate-900 mb-1' }, 'GTM Budget Calculator'),
        React.createElement('p', { className: 'text-sm text-slate-600 mb-2' }, 'Adjust your budget allocation and see real-time impact on pipeline'),
        React.createElement('p', { className: 'text-xs text-slate-700 italic' }, 'Recommended Strategy: Combine Webinar + Agency/SDR Outreach for direct pipeline generation while maintaining LinkedIn Ads + Google Remarketing + Content for long-term brand building and lead nurturing.')
      ),
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-4 gap-8' },
        React.createElement('div', { className: 'lg:col-span-1' },
          React.createElement('div', { className: 'bg-white rounded-xl shadow-lg p-6' },
            React.createElement('h2', { className: 'text-xl font-semibold text-slate-900 mb-6' }, 'Your Inputs'),
            React.createElement('div', { className: 'mb-4 flex flex-col gap-3' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-2' }, 'ARR'),
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
              React.createElement('div', { className: 'flex gap-2 mb-3' },
                [20000, 30000, 40000, 50000].map(amount =>
                  React.createElement('button', {
                    key: amount,
                    onClick: () => handleQuickBudget(amount),
                    className: `flex-1 py-2 rounded-lg font-medium text-sm ${budget === amount ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`
                  }, `$${amount / 1000}K`)
                )
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-xs font-medium text-slate-600 mb-2' }, 'Custom Budget'),
                React.createElement('div', { className: 'flex gap-2' },
                  React.createElement('input', {
                    type: 'number',
                    value: customBudgetInput,
                    onChange: (e) => setCustomBudgetInput(Number(e.target.value)),
                    placeholder: 'Enter custom amount',
                    className: 'flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm'
                  }),
                  React.createElement('button', {
                    onClick: () => {
                      const tiers = [20000, 30000, 40000, 50000];
                      const closestTier = tiers.filter(t => t <= customBudgetInput).sort((a, b) => b - a)[0] || 20000;
                      setBudget(customBudgetInput);
                      const profiles = customBudgetInput >= 50000 ? 3.5 : customBudgetInput >= 40000 ? 2.5 : customBudgetInput >= 30000 ? 2 : 1;
                      setOutreachProfiles(profiles);
                      setCustomBudgetInput('');
                    },
                    className: 'px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium'
                  }, 'Save')
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
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium' }, 'Meetings (12mo)'),
                React.createElement('p', { className: 'text-2xl font-bold text-blue-600' }, calculations.meetings12m)
              ),
              React.createElement('div', { className: 'bg-white rounded p-3 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium' }, 'Opps (12mo)'),
                React.createElement('p', { className: 'text-2xl font-bold text-emerald-600' }, calculations.opportunities12m)
              ),
              React.createElement('div', { className: 'bg-white rounded p-3 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium' }, 'Deals (12mo)'),
                React.createElement('p', { className: 'text-2xl font-bold text-purple-600' }, calculations.deals12m)
              ),
              React.createElement('div', { className: 'bg-white rounded p-3 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium' }, 'ARR (12mo)'),
                React.createElement('p', { className: 'text-lg font-bold text-amber-600' }, formatCurrency(calculations.revenue12m))
              )
            ),
            React.createElement('div', { className: 'mt-4 pt-4 border-t border-blue-200 grid grid-cols-4 gap-3 text-center text-sm' },
              React.createElement('div', null,
                React.createElement('p', { className: 'text-slate-600' }, '12mo Spend'),
                React.createElement('p', { className: 'font-bold text-slate-900' }, formatCurrency(calculations.monthlyBurn * 12))
              ),
              React.createElement('div', null,
                React.createElement('p', { className: 'text-slate-600' }, '18mo LTV'),
                React.createElement('p', { className: 'font-bold text-green-600' }, formatCurrency(calculations.revenue12m * 1.5)),
                React.createElement('p', { className: `text-xs font-semibold ${roi18mo >= 0 ? 'text-green-600' : 'text-red-600'}` }, `ROI: ${roi18mo >= 0 ? '+' : ''}${roi18mo.toFixed(0)}%`)
              ),
              React.createElement('div', null,
                React.createElement('p', { className: 'text-slate-600' }, '3yr LTV'),
                React.createElement('p', { className: 'font-bold text-green-600' }, formatCurrency(calculations.revenue12m * 3)),
                React.createElement('p', { className: `text-xs font-semibold ${roiValue3yr >= 0 ? 'text-green-600' : 'text-red-600'}` }, `ROI: ${roiValue3yr >= 0 ? '+' : ''}${roiValue3yr.toFixed(0)}%`)
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
              React.createElement('input', { type: 'number', value: outreachProfiles, onChange: (e) => setOutreachProfiles(Math.max(0, Number(e.target.value))), min: '0', className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm' }),
              React.createElement('p', { className: 'text-xs text-slate-500 mt-1' },
                outreachProfiles === 0 ? 'No outreach profiles selected' :
                outreachStrategy === 'agency' 
                  ? `Base: $5,500 + (${outreachProfiles - 1} × $3,300/month)`
                  : `Base: $7,500 + (${outreachProfiles - 1} × $6,750/month)`
              )
            ),
            budgetDifference !== 0 && React.createElement('div', { className: `mb-4 p-3 rounded-lg text-sm ${budgetDifference > 0 ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}` },
              budgetDifference > 0 ? `Over budget by ${formatCurrency(budgetDifference)}` : `Under budget by ${formatCurrency(Math.abs(budgetDifference))}`
            ),
            React.createElement('div', { className: 'space-y-2' },
              Object.keys(customAllocation)
                .sort()
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
                      step: '0.1',
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
            React.createElement('div', { className: 'grid grid-cols-5 gap-2 mb-6 pb-6 border-b border-slate-200' },
              React.createElement('div', { className: 'bg-slate-50 rounded p-2 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium mb-1' }, 'LinkedIn Ads'),
                React.createElement('p', { className: 'text-xl font-bold text-blue-600' }, calculations.linkedinAdsMeetingsActual),
                React.createElement('p', { className: 'text-xs text-slate-500 mt-1' }, `${formatCurrency(customAllocation['LinkedIn Ads'] || 0)}`)
              ),
              React.createElement('div', { className: 'bg-slate-50 rounded p-2 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium mb-1' }, 'Google Remarketing'),
                React.createElement('p', { className: 'text-xl font-bold text-indigo-600' }, calculations.googleRemarketingMeetingsActual),
                React.createElement('p', { className: 'text-xs text-slate-500 mt-1' }, `${formatCurrency(customAllocation['Google Remarketing'] || 0)}`)
              ),
              React.createElement('div', { className: 'bg-slate-50 rounded p-2 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium mb-1' }, 'Content/Organic'),
                React.createElement('p', { className: 'text-xl font-bold text-emerald-600' }, calculations.contentMeetingsActual),
                React.createElement('p', { className: 'text-xs text-slate-500 mt-1' }, `${formatCurrency(customAllocation['Content'] || 0)}`)
              ),
              React.createElement('div', { className: 'bg-slate-50 rounded p-2 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium mb-1' }, 'Outreach'),
                React.createElement('p', { className: 'text-xl font-bold text-purple-600' }, calculations.outreachMeetingsActual),
                React.createElement('p', { className: 'text-xs text-slate-500 mt-1' }, `${formatCurrency(customAllocation['Agency Outreach'] || customAllocation['Internal Outreach (Salary + Tools)'] || 0)}`)
              ),
              React.createElement('div', { className: 'bg-slate-50 rounded p-2 text-center' },
                React.createElement('p', { className: 'text-xs text-slate-600 font-medium mb-1' }, 'Webinar'),
                React.createElement('p', { className: 'text-xl font-bold text-amber-600' }, calculations.webinarMeetingsActual),
                React.createElement('p', { className: 'text-xs text-slate-500 mt-1' }, `${formatCurrency(customAllocation['Quarterly Webinar'] || 0)}`)
              )
            ),
            React.createElement('div', { className: 'flex justify-between items-center mb-4 gap-2' },
              React.createElement('h3', { className: 'text-lg font-semibold text-slate-900' }, 'Summary: Cost per Meeting by Channel'),
              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('button', {
                  onClick: () => setEditingCostPerMeeting(!editingCostPerMeeting),
                  className: `px-3 py-1 rounded text-sm font-medium transition ${editingCostPerMeeting ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`
                }, editingCostPerMeeting ? 'Cancel' : 'Edit'),
                React.createElement('button', {
                  onClick: () => {
                    setCustomCostPerMeeting({
                      'LinkedIn Ads': 5000,
                      'Google Remarketing': 2500,
                      'Agency Outreach': 850,
                      'Content': 3750,
                      'Webinar': 750,
                      'Internal SDR Outreach': 1955
                    });
                    setEditingCostPerMeeting(false);
                  },
                  className: 'px-3 py-1 rounded text-sm font-medium transition bg-slate-100 text-slate-700 hover:bg-slate-200'
                }, 'Reset')
              )
            ),
            editingCostPerMeeting && React.createElement('div', { className: 'bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6' },
              React.createElement('p', { className: 'text-sm font-medium text-slate-900 mb-4' }, 'Edit Cost per Meeting'),
              React.createElement('div', { className: 'space-y-3 mb-4' },
                Object.keys(customCostPerMeeting).map(channel =>
                  React.createElement('div', { key: channel },
                    React.createElement('label', { className: 'block text-sm font-medium text-slate-700 mb-1' }, channel),
                    React.createElement('input', {
                      type: 'number',
                      value: customCostPerMeeting[channel],
                      onChange: (e) => {
                        setCustomCostPerMeeting({
                          ...customCostPerMeeting,
                          [channel]: Number(e.target.value)
                        });
                      },
                      className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm'
                    })
                  )
                )
              ),
              React.createElement('button', {
                onClick: () => setEditingCostPerMeeting(false),
                className: 'w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition'
              }, 'Save Changes')
            ),
            React.createElement('div', { className: 'space-y-3 mb-6' },
              React.createElement('div', { className: 'flex justify-between items-center p-3 bg-slate-50 rounded-lg' },
                React.createElement('span', { className: 'text-slate-700 font-medium' }, 'Quarterly Webinar'),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('p', { className: 'text-slate-900 font-semibold' }, `$${customCostPerMeeting['Webinar']}`)
                ),
                React.createElement('span', { className: 'text-xs text-green-600 font-semibold' }, 'Most Efficient')
              ),
              React.createElement('div', { className: 'flex justify-between items-center p-3 bg-slate-50 rounded-lg' },
                React.createElement('span', { className: 'text-slate-700 font-medium' }, 'Google Remarketing'),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('p', { className: 'text-slate-900 font-semibold' }, `$${customCostPerMeeting['Google Remarketing']}`)
                )
              ),
              React.createElement('div', { className: 'flex justify-between items-center p-3 bg-slate-50 rounded-lg' },
                React.createElement('span', { className: 'text-slate-700 font-medium' }, 'Agency Outreach'),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('p', { className: 'text-slate-900 font-semibold' }, `$${customCostPerMeeting['Agency Outreach']}`)
                )
              ),
              React.createElement('div', { className: 'flex justify-between items-center p-3 bg-slate-50 rounded-lg' },
                React.createElement('span', { className: 'text-slate-700 font-medium' }, 'Content/Organic'),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('p', { className: 'text-slate-900 font-semibold' }, `$${customCostPerMeeting['Content']}`)
                )
              ),
              React.createElement('div', { className: 'flex justify-between items-center p-3 bg-slate-50 rounded-lg' },
                React.createElement('span', { className: 'text-slate-700 font-medium' }, 'LinkedIn Ads'),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('p', { className: 'text-slate-900 font-semibold' }, `$${customCostPerMeeting['LinkedIn Ads']}`)
                )
              ),
              React.createElement('div', { className: 'flex justify-between items-center p-3 bg-slate-50 rounded-lg' },
                React.createElement('span', { className: 'text-slate-700 font-medium' }, 'Internal SDR Outreach'),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('p', { className: 'text-slate-900 font-semibold' }, `$${customCostPerMeeting['Internal SDR Outreach']}`)
                )
              )
            ),
            React.createElement('div', { className: 'border-t border-slate-200 pt-4 space-y-4' },
              React.createElement('div', null,
                React.createElement('p', { className: 'text-sm font-semibold text-slate-900 mb-2' }, 'Key Insights:'),
                React.createElement('ul', { className: 'space-y-2 text-sm text-slate-700' },
                  keyInsights.map((insight, idx) =>
                    React.createElement('li', { key: idx }, '• ', insight)
                  )
                )
              ),
              React.createElement('div', { className: 'pt-4 border-t border-slate-200' },
                React.createElement('p', { className: 'text-sm font-semibold text-slate-900 mb-2' }, 'Recommended Budget Allocation by Tier:'),
                React.createElement('ul', { className: 'space-y-1 text-sm text-slate-700' },
                  React.createElement('li', null, '• ', React.createElement('span', { className: 'font-semibold' }, '$20K:'), ' Foundational GTM with 1 SDR/Agency Outreach profile, webinars, and content optimization'),
                  React.createElement('li', null, '• ', React.createElement('span', { className: 'font-semibold' }, '$30K:'), ' Scale to 2 SDR profiles, increase content production, add Google remarketing, expand webinar investment, and add buffer for testing new channels'),
                  React.createElement('li', null, '• ', React.createElement('span', { className: 'font-semibold' }, '$40K:'), ' Scale to 2.5 SDR profiles, increase webinar investment, strengthen LinkedIn paid presence, organic content and Google remarketing.'),
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
