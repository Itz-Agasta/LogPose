"use client";

import { DataDownload } from "@/components/profile/DataDownload";
import { MultiParameterProfile } from "@/components/profile/graphs/MultiParameterProfile";
import { OceanographicProfile } from "@/components/profile/graphs/OceanographicProfile";
import { TemperatureSalinityDiagram } from "@/components/profile/graphs/TemperatureSalinityDiagram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CycleProfile, FloatProfileMetadata } from "@LogPose/schema/api/profile";

interface DashboardProps {
  metadata: FloatProfileMetadata;
  currentCycle: CycleProfile;
  hasOxygen: boolean;
  hasChlorophyll: boolean;
  hasNitrate: boolean;
}

export function Dashboard({
  metadata,
  currentCycle,
  hasOxygen,
  hasChlorophyll,
  hasNitrate,
}: DashboardProps) {
  const hasBGC = hasChlorophyll || hasNitrate || hasOxygen;

  const numProfiles = 2 + (hasOxygen ? 1 : 0) + (hasChlorophyll ? 1 : 0) + (hasNitrate ? 1 : 0);
  const profileWidth = numProfiles <= 2 ? 450 : 350;

  const numBGC = (hasChlorophyll ? 1 : 0) + (hasOxygen ? 1 : 0) + (hasNitrate ? 1 : 0);
  const bgcWidth = numBGC <= 1 ? 500 : 400;

  return (
    <div className="space-y-6 w-full">
      <div className="w-full">
        <DataDownload data={currentCycle.measurements} metadata={metadata} />
      </div>

      <div className="w-full">
        <Tabs defaultValue="profiles" className="w-full flex flex-col">
          <TabsList className={`grid w-full h-11 ${hasBGC ? "grid-cols-4" : "grid-cols-3"}`}>
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
                height={400}
              />
              <OceanographicProfile
                data={currentCycle.measurements}
                parameter="salinity"
                title="Practical Salinity"
                unit="PSU"
                color="#2563eb"
                width={profileWidth}
                height={400}
              />
              {hasOxygen && (
                <OceanographicProfile
                  data={currentCycle.measurements}
                  parameter="oxygen"
                  title="Dissolved Oxygen"
                  unit="μmol/kg"
                  color="#059669"
                  width={profileWidth}
                  height={400}
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
                  height={400}
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
                  height={400}
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
                    width={800}
                    height={600}
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
                    width={1000}
                    height={600}
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
                    height={450}
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
                    height={450}
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
                    height={450}
                  />
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
