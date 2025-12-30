function GTMCalculator() {
  const [acv, setAcv] = React.useState(25000);
  const [salesCycle, setSalesCycle] = React.useState(90);
  const [budget, setBudget] = React.useState(30000);
  const [closeRate, setCloseRate] = React.useState(20);
  const [qualificationRate, setQualificationRate] = React.useState(20);
  const [paidMediaStrategy, setPaidMediaStrategy] = React.useState('agency');
  const [outreachStrategy, setOutreachStrategy] = React.useState('agency');
  const [outreachProfiles, setOutreachProfiles] = React.useState(1);
  const [resetTrigger, setResetTrigger] = React.useState(0);

  const formatCurrency = (num) => {
    return `$${num.toLocaleString('en-US')}`;
  };

  const getBudgetTier = (budgetValue) => {
    const tiers = [20000, 30000, 40000, 50000];
    return tiers.reduce((prev, curr) =>
      Math.abs(curr - budgetValue) < Math.abs(prev - budgetValue) ? curr : prev
    );
  };

  const tierBudget = getBudgetTier(budget);
  
  const getDefaultProfilesForBudget = (budgetAmount) => {
    if (budgetAmount >= 45000) return 3;
    if (budgetAmount >= 35000) return 2;
    return 1;
  };

  const getDefaultAllocations = () => {
    const baseAllocations = {
      20000: {
        'LinkedIn Ads': 4500,
        'Content': 3000,
        'SEO Agency Fees': 2500,
        'Website/CRM/Tools': 1000,
        'Quarterly Webinar': 1000,
        'Buffer/Testing': 0,
      },
      30000: {
        'LinkedIn Ads': 8000,
        'Content': 5000,
        'SEO Agency Fees': 2500,
        'Website/CRM/Tools': 2000,
        'Quarterly Webinar': 1500,
        'Buffer/Testing': 3000,
      },
      40000: {
        'LinkedIn Ads': 12000,
        'Content': 6000,
        'SEO Agency Fees': 2500,
        'Website/CRM/Tools': 2500,
        'Quarterly Webinar': 3250,
        'Agency Fees (Paid + Content)': 2500,
        'Agency Outreach': 8800,
        'Buffer/Testing': 2450,
      },
      50000: {
        'LinkedIn Ads': 15000,
        'Content': 6500,
        'SEO Agency Fees': 2500,
        'Website/CRM/Tools': 2500,
        'Quarterly Webinar': 3250,
        'Agency Fees (Paid + Content)': 2500,
        'Agency Outreach': 12100,
        'Buffer/Testing': 5650,
      },
    };

    const allocations = {};
    
    for (const tier in baseAllocations) {
      allocations[tier] = { ...baseAllocations[tier] };
      
      if (paidMediaStrategy === 'agency') {
        const linkedinBudget = allocations[tier]['LinkedIn Ads'];
        const percentageFee = Math.round(linkedinBudget * 0.15);
        const agencyFee = Math.max(2500, percentageFee);
        allocations[tier]['Agency Fees (Paid + Content)'] = agencyFee;
      } else {
        delete allocations[tier]['Agency Fees (Paid + Content)'];
        allocations[tier]['Growth Manager (Paid Media)'] = 12500;
      }
      
      if (outreachStrategy === 'agency') {
        const baseCost = 5500;
        const totalOutreachCost = baseCost + ((outreachProfiles - 1) * baseCost * 0.6);
        allocations[tier]['Agency Outreach'] = Math.round(totalOutreachCost);
        delete allocations[tier]['Internal Outreach (Salary + Tools)'];
      } else {
        delete allocations[tier]['Agency Outreach'];
        const baseCost = 7500;
        const totalOutreachCost = baseCost + ((outreachProfiles - 1) * baseCost * 0.9);
        allocations[tier]['Internal Outreach (Salary + Tools)'] = Math.round(totalOutreachCost);
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
  }, [paidMediaStrategy, outreachStrategy, outreachProfiles, budget, resetTrigger]);

  const handleQuickBudget = (amount) => {
    setBudget(amount);
    const defaultProfiles = getDefaultProfilesForBudget(amount);
    setOutreachProfiles(defaultProfiles);
    setResetTrigger(prev => prev + 1);
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
    
    const defaults = getDefaultAllocations()[30000];
    const newPercentages = {};
    for (const channel in defaults) {
      newPercentages[channel] = (defaults[channel] / 30000) * 100;
    }
    setAllocationPercentages(newPercentages);
    setResetTrigger(prev => prev + 1);
  };

  const customAllocation = React.useMemo(() => {
    return Object.keys(allocationPercentages).reduce((acc, channel) => {
      acc[channel] = Math.round((allocationPercentages[channel] / 100) * budget);
      return acc;
    }, {});
  }, [allocationPercentages, budget]);

  const allocationTotal = Object.values(customAllocation).reduce((a, b) => a + b, 0);
  const budgetBalanced = Math.abs(allocationTotal - budget) < 1;
  const budgetDifference = allocationTotal - budget;

  const calculations = React.useMemo(() => {
    let linkedinAdsMeetings, contentMeetings, baseOutreachMeetings, webinarMeetings;
    
    if (budget <= 25000) {
      linkedinAdsMeetings = 1;
      contentMeetings = 1.5;
      baseOutreachMeetings = outreachStrategy === 'agency' ? 6 : 4;
      webinarMeetings = 2;
    } else if (budget >= 35000 && budget < 45000) {
      linkedinAdsMeetings = 2;
      contentMeetings = 3;
      baseOutreachMeetings = outreachStrategy === 'agency' ? 10.5 : 7;
      webinarMeetings = 2;
    } else if (budget >= 45000) {
      linkedinAdsMeetings = 2;
      contentMeetings = 3.5;
      baseOutreachMeetings = outreachStrategy === 'agency' ? 10.5 : 7;
      webinarMeetings = 2.5;
    } else {
      linkedinAdsMeetings = 1;
      contentMeetings = 2;
      baseOutreachMeetings = outreachStrategy === 'agency' ? 6 : 4;
      webinarMeetings = 2;
    }

    const outreachMedianCost = outreachStrategy === 'agency' ? 850 : 1955;
    const baseCost = outreachStrategy === 'agency' ? 5500 : 7500;
    const baseMetings = baseCost / outreachMedianCost;
    const additionalCostPerProfile = outreachStrategy === 'agency' 
      ? baseCost * 0.6 
      : baseCost * 0.9;
    const additionalMeetingsPerProfile = additionalCostPerProfile / outreachMedianCost;
    const outreachMeetings = baseMetings + ((outreachProfiles - 1) * additionalMeetingsPerProfile);

    const totalMeetingsPerMonth = linkedinAdsMeetings + contentMeetings + outreachMeetings + webinarMeetings;
    const opportunitiesPerMonth = (totalMeetingsPerMonth * qualificationRate) / 100;
    const closedDealsPerMonth = (opportunitiesPerMonth * closeRate) / 100;

    const meetings6m = totalMeetingsPerMonth * 6;
    const opportunities6m = (meetings6m * qualificationRate) / 100;
    const deals6m = (opportunities6m * closeRate) / 100;
    const revenue6m = deals6m * acv;

    const meetings12m = totalMeetingsPerMonth * 12;
    const opportunities12m = (meetings12m * qualificationRate) / 100;
    const deals12m = Math.round((opportunities12m * closeRate) / 100);
    const revenue12m = deals12m * acv;

    const monthlyBurn = budget;

    return {
      linkedinAdsMeetings,
      contentMeetings,
      outreachMeetings: Math.max(0, Math.round(outreachMeetings * 10) / 10),
      webinarMeetings,
      totalMeetingsPerMonth,
      opportunitiesPerMonth: Math.round(opportunitiesPerMonth * 10) / 10,
      closedDealsPerMonth: Math.round(closedDealsPerMonth * 10) / 10,
      meetings6m: Math.round(meetings6m),
      opportunities6m: Math.round(opportunities6m),
      deals6m: Math.round(deals6m),
      revenue6m,
      meetings12m: Math.round(meetings12m),
      opportunities12m: Math.round(opportunities12m),
      deals12m: Math.round(deals12m),
      revenue12m,
      monthlyBurn,
    };
  }, [acv, closeRate, qualificationRate, outreachStrategy, outreachProfiles, budget]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">GTM Budget Calculator</h1>
          <p className="text-sm text-slate-600 mb-2">Adjust your budget allocation and see real-time impact on pipeline</p>
          <p className="text-xs text-slate-700 italic">Recommended Strategy: Combine Webinar + Agency/SDR Outreach for direct pipeline generation while maintaining LinkedIn Ads + Content for long-term brand building and lead nurturing.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8 max-h-[calc(100vh-100px)] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Your Inputs</h2>
                <button
                  onClick={resetAllocation}
                  className="py-1 px-2 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Reset
                </button>
              </div>

              <div className="mb-4 flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    💰 ACV
                  </label>
                  <input
                    type="number"
                    value={acv}
                    onChange={(e) => setAcv(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    📅 Sales Cycle (days)
                  </label>
                  <input
                    type="number"
                    value={salesCycle}
                    onChange={(e) => setSalesCycle(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    📊 Meeting > Opp (%)
                  </label>
                  <input
                    type="number"
                    value={qualificationRate}
                    onChange={(e) => setQualificationRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    📈 Close Rate (%)
                  </label>
                  <input
                    type="number"
                    value={closeRate}
                    onChange={(e) => setCloseRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  🎯 Monthly Budget
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickBudget(20000)}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${
                      budget === 20000
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    $20K
                  </button>
                  <button
                    onClick={() => handleQuickBudget(30000)}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${
                      budget === 30000
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    $30K
                  </button>
                  <button
                    onClick={() => handleQuickBudget(40000)}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${
                      budget === 40000
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    $40K
                  </button>
                  <button
                    onClick={() => handleQuickBudget(50000)}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${
                      budget === 50000
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    $50K
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-4 mb-4 border border-blue-200">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">12-Month Impact</h3>
                <p className="text-xs text-slate-600 italic">Includes 3-month setup & optimization phase: Month 1 (0%), Month 2 (25%), Month 3 (75%), Months 4-12 (100%)</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs text-slate-600 font-medium mb-1">Meetings</p>
                  <p className="text-xl font-bold text-blue-600">{Math.round((calculations.meetings12m * 10) / 12)}</p>
                </div>
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs text-slate-600 font-medium mb-1">Opps</p>
                  <p className="text-xl font-bold text-emerald-600">{Math.round((calculations.opportunities12m * 10) / 12)}</p>
                </div>
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs text-slate-600 font-medium mb-1">Deals</p>
                  <p className="text-xl font-bold text-purple-600">{Math.round((calculations.deals12m * 10) / 12)}</p>
                </div>
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs text-slate-600 font-medium mb-1">Revenue</p>
                  <p className="text-sm font-bold text-amber-600">{formatCurrency(Math.round((calculations.deals12m * 10) / 12) * acv)}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-slate-600">12mo Spend</p>
                  <p className="text-xs font-bold text-slate-900">{formatCurrency(calculations.monthlyBurn * 12)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">3yr LTV</p>
                  <p className="text-xs font-bold text-green-600">{formatCurrency(Math.round((calculations.deals12m * 10) / 12) * acv * 3)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">ROI</p>
                  <p className={`text-xs font-bold ${((((Math.round((calculations.deals12m * 10) / 12) * acv * 3) - (calculations.monthlyBurn * 12)) / (calculations.monthlyBurn * 12)) * 100) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {((((Math.round((calculations.deals12m * 10) / 12) * acv * 3) - (calculations.monthlyBurn * 12)) / (calculations.monthlyBurn * 12)) * 100) >= 0 
                      ? `${(((((Math.round((calculations.deals12m * 10) / 12) * acv * 3) - (calculations.monthlyBurn * 12)) / (calculations.monthlyBurn * 12)) * 100)).toFixed(0)}%`
                      : `(${Math.abs((((((Math.round((calculations.deals12m * 10) / 12) * acv * 3) - (calculations.monthlyBurn * 12)) / (calculations.monthlyBurn * 12)) * 100)).toFixed(0))}%)`
                    }
                  </p>
                </div>
              </div>
            </div>

            <div key={`allocation-${resetTrigger}`} className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  📊 Monthly Budget Allocation ({formatCurrency(allocationTotal)}/month)
                </h3>
              </div>

              <div className="mb-6 flex gap-4 pb-6 border-b border-slate-200">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Paid Media Strategy
                  </label>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setPaidMediaStrategy('agency')}
                      className={`py-3 px-3 rounded-lg text-sm font-medium transition border-2 ${
                        paidMediaStrategy === 'agency'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold">Agency</div>
                      <div className="text-xs mt-1">$2,500 base + 15% of LinkedIn Ads</div>
                    </button>
                    <button
                      onClick={() => setPaidMediaStrategy('internal')}
                      className={`py-3 px-3 rounded-lg text-sm font-medium transition border-2 ${
                        paidMediaStrategy === 'internal'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold">Internal Resource</div>
                      <div className="text-xs mt-1">$12,500/month (Salary + Tools)</div>
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Outreach Strategy
                  </label>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setOutreachStrategy('agency')}
                      className={`py-3 px-3 rounded-lg text-sm font-medium transition border-2 ${
                        outreachStrategy === 'agency'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold">Agency</div>
                      <div className="text-xs mt-1">
                        $5,500/month + $3,300/month per additional profile
                      </div>
                    </button>
                    <button
                      onClick={() => setOutreachStrategy('internal')}
                      className={`py-3 px-3 rounded-lg text-sm font-medium transition border-2 ${
                        outreachStrategy === 'internal'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold">Internal Resource</div>
                      <div className="text-xs mt-1">
                        $7,500/month + $6,750/month per additional profile
                      </div>
                    </button>
                  </div>
                  
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Profiles/SDRs {budget >= 45000 ? '(default: 3)' : budget >= 35000 ? '(default: 2)' : '(default: 1)'}
                    </label>
                    <input
                      type="number"
                      value={outreachProfiles}
                      onChange={(e) => setOutreachProfiles(Math.max(1, Number(e.target.value)))}
                      min="1"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {outreachStrategy === 'agency' 
                        ? `+60% per additional profile ($3,300/month)`
                        : `+90% per additional profile ($6,750/month)`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {!budgetBalanced && (
                <div
                  className={`mb-6 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    budgetDifference > 0
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-green-50 text-green-800 border border-green-200'
                  }`}
                >
                  {budgetDifference > 0
                    ? `⚠️ Over budget by ${formatCurrency(budgetDifference)}`
                    : `✓ Under budget by ${formatCurrency(Math.abs(budgetDifference))}`}
                </div>
              )}

              <div className="space-y-4">
                {Object.keys(customAllocation)
                  .sort((a, b) => customAllocation[b] - customAllocation[a])
                  .map((channel) => (
                    <div key={channel}>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700">{channel}</label>
                        <div className="text-right">
                          <span className="font-semibold text-slate-900 text-sm">{formatCurrency(customAllocation[channel])}</span>
                          <span className="text-xs text-slate-500 ml-2">{allocationPercentages[channel]?.toFixed(1)}%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={allocationPercentages[channel] || 0}
                        onChange={(e) => {
                          const newPercentages = { ...allocationPercentages };
                          newPercentages[channel] = Number(e.target.value);
                          setAllocationPercentages(newPercentages);
                        }}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary: Cost per Meeting by Channel</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Quarterly Webinar</span>
                  <div className="text-right">
                    <p className="text-slate-900 font-semibold">$750</p>
                    <p className="text-xs text-slate-500">($500-$1,000)</p>
                  </div>
                  <span className="text-xs text-green-600 font-semibold ml-3">Most Efficient</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Agency Outreach</span>
                  <div className="text-right">
                    <p className="text-slate-900 font-semibold">$850</p>
                    <p className="text-xs text-slate-500">Direct & predictable</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">LinkedIn Ads</span>
                  <div className="text-right">
                    <p className="text-slate-900 font-semibold">$7,000</p>
                    <p className="text-xs text-slate-500">Nurture & brand</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Content/Organic</span>
                  <div className="text-right">
                    <p className="text-slate-900 font-semibold">$3,750</p>
                    <p className="text-xs text-slate-500">Long-term ROI</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Internal SDR Outreach</span>
                  <div className="text-right">
                    <p className="text-slate-900 font-semibold">$1,955</p>
                    <p className="text-xs text-slate-500">Full control & scale</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2">Key Insights:</p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• <span className="font-semibold">Quarterly Webinar</span> delivers the lowest cost per meeting at $750, making it the most efficient channel for consistent, high-quality pipeline generation</li>
                    <li>• <span className="font-semibold">Agency Outreach</span> is a close second at $850 median with predictable volume and direct control over messaging</li>
                    <li>• <span className="font-semibold">Internal SDR Outreach</span> costs $1,955/meeting but provides full control and maximum personalization for enterprise accounts</li>
                    <li>• <span className="font-semibold">LinkedIn Ads</span> at $7,000/meeting serves as a nurture and brand-building channel rather than direct pipeline generation</li>
                    <li>• <span className="font-semibold">Content/Organic</span> at $3,750/meeting builds long-term authority and supports the full sales funnel</li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Recommended Budget Allocation by Tier:</p>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>• <span className="font-semibold">$20K:</span> Foundational GTM with 1 SDR/Agency Outreach profile, webinars, and content optimization</li>
                    <li>• <span className="font-semibold">$30K:</span> Increased content production, expanded webinar cadence, and buffer for testing new channels</li>
                    <li>• <span className="font-semibold">$40K:</span> Scale to 2 SDR profiles, increase webinar frequency, strengthen LinkedIn paid presence and organic content</li>
                    <li>• <span className="font-semibold">$50K:</span> Full SDR team (3 profiles), premium content program, sustained brand building across all channels with experimental budget</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const { createRoot } = ReactDOM;
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(GTMCalculator));
