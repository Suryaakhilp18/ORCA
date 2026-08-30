'use client';

import React, { useState, useEffect } from 'react';
import { NavigationHeader, PrimaryTab } from '@/components/NavigationHeader';
import { HomeLandingPage } from '@/components/HomeLandingPage';
import { CaptainWorkspace } from '@/components/CaptainWorkspace';
import { AiAssistanceSection } from '@/components/AiAssistanceSection';
import { BottomNav } from '@/components/BottomNav';
import { UserProfileModal } from '@/components/UserProfileModal';
import { WhyRationaleDrawer } from '@/components/WhyRationaleDrawer';
import { EvidenceGraphModal } from '@/components/EvidenceGraphModal';
import { AdvancedTraceModal } from '@/components/AdvancedTraceModal';

import {
  QueryResponse,
  PFZCandidate,
  CoastalLocation
} from '@/types';
import { submitMarineQuery, fetchLocations } from '@/lib/apiClient';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<PrimaryTab>('home');
  const [workspaceSubTab, setWorkspaceSubTab] = useState<string>('command');
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');

  const [language, setLanguage] = useState<string>('en');
  const [allLocations, setAllLocations] = useState<CoastalLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<CoastalLocation | null>(null);
  
  // queryData is null initially — no assessment generated until user clicks ANALYZE!
  const [queryData, setQueryData] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<PFZCandidate | undefined>(undefined);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isWhyOpen, setIsWhyOpen] = useState<boolean>(false);
  const [isGraphOpen, setIsGraphOpen] = useState<boolean>(false);
  const [isTraceOpen, setIsTraceOpen] = useState<boolean>(false);

  // Initialize locations list on mount (without executing query)
  useEffect(() => {
    async function init() {
      try {
        const locs = await fetchLocations();
        setAllLocations(locs);
        const defaultLoc = locs.find((l) => l.name === 'Visakhapatnam') || locs[0];
        if (defaultLoc) {
          setSelectedLocation(defaultLoc);
          // Pure context setup — do NOT auto-run query!
        }
      } catch (err) {
        console.error('Failed to initialize locations:', err);
      }
    }
    init();
  }, []);

  const runQuery = async (queryText: string, loc?: CoastalLocation) => {
    setIsLoading(true);
    try {
      // Execute backend fetch and exact 14s (2s * 7 agents) in parallel
      const backendPromise = submitMarineQuery(queryText, language);
      const timerPromise = new Promise((resolve) => setTimeout(resolve, 14000));

      const [resp] = await Promise.all([backendPromise, timerPromise]);

      setQueryData(resp);
      if (resp.candidates && resp.candidates.length > 0) {
        setSelectedCandidate(resp.selected_pfz || resp.candidates[0]);
      }
    } catch (err) {
      console.error('Query failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (loc: CoastalLocation) => {
    setSelectedLocation(loc);
    // Sets context only — does NOT auto-query
  };

  const handleNavigateToAi = (prompt = '') => {
    setAiInitialPrompt(prompt);
    setActiveTab('ai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickSearch = (query: string) => {
    handleNavigateToAi(query);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0 bg-slate-950 text-slate-100 font-sans">
      {/* Top Main Navigation Header (Exactly 3 Primary Tabs) */}
      <NavigationHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        onLanguageChange={setLanguage}
        onOpenProfile={() => setIsProfileOpen(true)}
        onQuickSearch={handleQuickSearch}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ===================================================================== */}
        {/* 1. HOME — INTRODUCTION ONLY (Zero operational data on Home)          */}
        {/* ===================================================================== */}
        {activeTab === 'home' && (
          <HomeLandingPage
            onEnterOrca={() => {
              setActiveTab('orca');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            language={language}
          />
        )}

        {/* ===================================================================== */}
        {/* 2. ORCA / CAPTAIN — THE OPERATIONAL WORKSPACE (Location, Map, Agents)  */}
        {/* ===================================================================== */}
        {activeTab === 'orca' && (
          <CaptainWorkspace
            data={queryData}
            selectedCandidate={selectedCandidate}
            onSelectCandidate={setSelectedCandidate}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            allLocations={allLocations}
            onOpenWhy={() => setIsWhyOpen(true)}
            onOpenEvidenceGraph={() => setIsGraphOpen(true)}
            onNavigateToAi={handleNavigateToAi}
            onRunQuery={runQuery}
            initialSubTab={workspaceSubTab}
            language={language}
            isLoading={isLoading}
          />
        )}

        {/* ===================================================================== */}
        {/* 3. AI ASSISTANCE — CONVERSATIONAL INTELLIGENCE & COPILOT             */}
        {/* ===================================================================== */}
        {activeTab === 'ai' && (
          <AiAssistanceSection
            queryData={queryData}
            selectedLocation={selectedLocation}
            language={language}
            initialPrompt={aiInitialPrompt}
          />
        )}
      </main>

      {/* Persistent Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab as PrimaryTab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals & Drawers */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
        language={language}
        onLanguageChange={setLanguage}
      />

      <WhyRationaleDrawer
        isOpen={isWhyOpen}
        onClose={() => setIsWhyOpen(false)}
        whyData={queryData?.why_explanation}
      />

      <EvidenceGraphModal
        isOpen={isGraphOpen}
        onClose={() => setIsGraphOpen(false)}
        graphData={queryData?.evidence_graph}
      />

      <AdvancedTraceModal
        isOpen={isTraceOpen}
        onClose={() => setIsTraceOpen(false)}
        queryData={queryData}
      />
    </div>
  );
}
