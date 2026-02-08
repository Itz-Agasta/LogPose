"use client";

import { DataDownload } from "@/components/profile/DataDownload";
import { MultiParameterProfile } from "@/components/profile/graphs/MultiParameterProfile";
import { OceanographicProfile } from "@/components/profile/graphs/OceanographicProfile";
import { TemperatureSalinityDiagram } from "@/components/profile/graphs/TemperatureSalinityDiagram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Graph, type GraphProps } from "@/components/tambo/graph";
import type { CycleProfile, FloatProfileMetadata } from "@LogPose/schema/api/profile";

interface DashboardProps {
  metadata: FloatProfileMetadata;
  currentCycle: CycleProfile;
  hasOxygen: boolean;
  hasChlorophyll: boolean;
  hasNitrate: boolean;
  isAiSidebarOpen?: boolean;
}

export function Dashboard({
  metadata,
  currentCycle,
  hasOxygen,
  hasChlorophyll,
  hasNitrate,
  isAiSidebarOpen = false,
  activeTab,
  onTabChange,
  aiGraphConfig,
}: DashboardProps & {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  aiGraphConfig?: GraphProps | null;
}) {
  const hasBGC = hasChlorophyll || hasNitrate || hasOxygen;

  const numProfiles = 2 + (hasOxygen ? 1 : 0) + (hasChlorophyll ? 1 : 0) + (hasNitrate ? 1 : 0);
  const numBGC = (hasChlorophyll ? 1 : 0) + (hasOxygen ? 1 : 0) + (hasNitrate ? 1 : 0);

  // Adjust widths based on sidebar state
  // On 13" screen (~1280px), sidepanel is 384px (96 * 4).
  // Remaining space roughly 850px. minus padding ~800px.
  // We need to fit 2 profiles or 3 profiles.

  // Base width calculations
  const baseProfileWidth = numProfiles <= 2 ? 450 : 350;
  const baseBgcWidth = numBGC <= 1 ? 500 : 400;

  // Reduced widths when sidebar is open
  const reducedProfileWidth = numProfiles <= 2 ? 380 : 280;
  const reducedBgcWidth = numBGC <= 1 ? 400 : 300;

  const profileWidth = isAiSidebarOpen ? reducedProfileWidth : baseProfileWidth;
  const bgcWidth = isAiSidebarOpen ? reducedBgcWidth : baseBgcWidth;

  return (
    <div className="space-y-6 w-full">
      <div className="w-full">
        <DataDownload data={currentCycle.measurements} metadata={metadata} />
      </div>

      <div className="w-full">
        <Tabs
          defaultValue="profiles"
          value={activeTab}
          onValueChange={onTabChange}
          className="w-full flex flex-col"
        >
          <TabsList
            className={`grid w-full h-11 ${
              hasBGC
                ? aiGraphConfig
                  ? "grid-cols-5"
                  : "grid-cols-4"
                : aiGraphConfig
                  ? "grid-cols-4"
                  : "grid-cols-3"
            }`}
          >
            <TabsTrigger value="profiles" className="text-sm">
              Individual Profiles
            </TabsTrigger>
            <TabsTrigger value="ts-diagram" className="text-sm">
              T-S Diagram
            </TabsTrigger>
            <TabsTrigger value="multi-param" className="text-sm">
              Multi-Parameter
            </TabsTrigger>
            {hasBGC && (
              <TabsTrigger value="biogeochemical" className="text-sm">
                Biogeochemical
              </TabsTrigger>
            )}
            {aiGraphConfig && (
              <TabsTrigger
                value="ai-analysis"
                className="text-sm flex items-center gap-2 data-[state=active]:text-primary"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Agent Analysis
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profiles" className="mt-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <OceanographicProfile
                data={currentCycle.measurements}
                parameter="temperature"
                title="Sea Temperature"
                unit="°C"
                color="#dc2626"
                width={profileWidth}
                height={isAiSidebarOpen ? 300 : 400}
              />
              <OceanographicProfile
                data={currentCycle.measurements}
                parameter="salinity"
                title="Practical Salinity"
                unit="PSU"
                color="#2563eb"
                width={profileWidth}
                height={isAiSidebarOpen ? 300 : 400}
              />
              {hasOxygen && (
                <OceanographicProfile
                  data={currentCycle.measurements}
                  parameter="oxygen"
                  title="Dissolved Oxygen"
                  unit="μmol/kg"
                  color="#059669"
                  width={profileWidth}
                  height={isAiSidebarOpen ? 300 : 400}
                />
              )}
              {hasNitrate && (
                <OceanographicProfile
                  data={currentCycle.measurements}
                  parameter="nitrate"
                  title="Nitrate Profile"
                  unit="μmol/kg"
                  color="#ea580c"
                  width={profileWidth}
                  height={isAiSidebarOpen ? 300 : 400}
                />
              )}
              {hasChlorophyll && (
                <OceanographicProfile
                  data={currentCycle.measurements}
                  parameter="chlorophyll"
                  title="Chlorophyll-a"
                  unit="mg/m³"
                  color="#16a34a"
                  width={profileWidth}
                  height={isAiSidebarOpen ? 300 : 400}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="ts-diagram" className="mt-6">
            <div className="space-y-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-xl">Temperature-Salinity Diagram</CardTitle>
                  <p className="text-muted-foreground">
                    Visualizing water mass characteristics through T-S relationship
                  </p>
                </CardHeader>
                <CardContent className="flex justify-center overflow-x-auto">
                  <TemperatureSalinityDiagram
                    data={currentCycle.measurements}
                    width={isAiSidebarOpen ? 600 : 800}
                    height={isAiSidebarOpen ? 400 : 600}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="multi-param" className="mt-6">
            <div className="space-y-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-xl">Multi-Parameter Profile</CardTitle>
                  <p className="text-muted-foreground">
                    Simultaneous visualization of multiple oceanographic parameters
                  </p>
                </CardHeader>
                <CardContent className="flex justify-center overflow-x-auto">
                  <MultiParameterProfile
                    data={currentCycle.measurements}
                    width={isAiSidebarOpen ? 550 : 1000}
                    height={isAiSidebarOpen ? 350 : 600}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {hasBGC && (
            <TabsContent value="biogeochemical" className="mt-6">
              <div className="flex flex-wrap gap-6 justify-center">
                {hasChlorophyll && (
                  <OceanographicProfile
                    data={currentCycle.measurements}
                    parameter="chlorophyll"
                    title="Chlorophyll-a"
                    unit="mg/m³"
                    color="#16a34a"
                    width={bgcWidth}
                    height={isAiSidebarOpen ? 350 : 450}
                  />
                )}
                {hasOxygen && (
                  <OceanographicProfile
                    data={currentCycle.measurements}
                    parameter="oxygen"
                    title="Dissolved Oxygen"
                    unit="μmol/kg"
                    color="#059669"
                    width={bgcWidth}
                    height={isAiSidebarOpen ? 350 : 450}
                  />
                )}
                {hasNitrate && (
                  <OceanographicProfile
                    data={currentCycle.measurements}
                    parameter="nitrate"
                    title="Nitrate"
                    unit="μmol/kg"
                    color="#ea580c"
                    width={bgcWidth}
                    height={isAiSidebarOpen ? 350 : 450}
                  />
                )}
              </div>
            </TabsContent>
          )}

          <TabsContent value="ai-analysis" className="mt-6">
            {aiGraphConfig ? (
              <div className="space-y-6">
                <Card className="w-full border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {aiGraphConfig.title}
                    </CardTitle>
                    <p className="text-muted-foreground">Generated by Poseidon</p>
                  </CardHeader>
                  <CardContent className="flex justify-center overflow-x-auto">
                    <Graph
                      {...aiGraphConfig}
                      variant="default" // Force default variant for consistent look
                      className="w-full min-h-[400px]"
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Ask Poseidon to generate a graph to see it here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
