"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import type { ProfileMeasurement } from "@LogPose/schema/api/profile";

type MeasurementKey = "temperature" | "salinity" | "oxygen" | "chlorophyll" | "nitrate";

interface ParameterConfig {
  key: MeasurementKey;
  label: string;
  unit: string;
  color: string;
}

const DEFAULT_PARAMETERS: ParameterConfig[] = [
  { key: "temperature", label: "Temperature", unit: "°C", color: "#ef4444" },
  { key: "salinity", label: "Salinity", unit: "PSU", color: "#3b82f6" },
];

const BGC_PARAMETERS: ParameterConfig[] = [
  { key: "oxygen", label: "Oxygen", unit: "µmol/kg", color: "#22c55e" },
  { key: "chlorophyll", label: "Chlorophyll", unit: "mg/m³", color: "#a855f7" },
  { key: "nitrate", label: "Nitrate", unit: "µmol/kg", color: "#f97316" },
];

interface MultiParameterProfileProps {
  data: ProfileMeasurement[];
  width?: number;
  height?: number;
}

export function MultiParameterProfile({
  data,
  width = 800,
  height = 500,
}: MultiParameterProfileProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Determine which parameters have data
    const availableParams = [...DEFAULT_PARAMETERS];
    for (const p of BGC_PARAMETERS) {
      if (data.some((d) => d[p.key] != null)) {
        availableParams.push(p);
      }
    }

    const margin = { top: 40, right: 30, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "currentColor")
      .text("Multi-Parameter Profile");

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", 1000);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Y-axis: pressure (depth)
    const yExtent = d3.extent(data, (d) => d.pressure) as [number, number];
    const yScale = d3.scaleLinear().domain(yExtent).range([0, innerHeight]);

    // X-axis: normalized 0-1 for all parameters
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);

    // Y-axis
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => `${d}`)
      .ticks(10);

    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "currentColor");

    g.selectAll(".domain, .tick line")
      .style("stroke", "currentColor")
      .style("stroke-width", 1)
      .style("opacity", 0.3);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => ""),
      )
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.1);

    // Y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 16)
      .attr("x", -(height / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("fill", "currentColor")
      .text("Pressure (dbar)");

    // Draw each parameter as a normalized line
    for (const param of availableParams) {
      const paramData = data.filter((d) => d[param.key] != null);
      if (!paramData.length) continue;

      const paramExtent = d3.extent(paramData, (d) => Number(d[param.key])) as [number, number];
      const normalizer = d3.scaleLinear().domain(paramExtent).range([0, 1]);

      const line = d3
        .line<ProfileMeasurement>()
        .x((d) => xScale(normalizer(Number(d[param.key]))))
        .y((d) => yScale(d.pressure))
        .curve(d3.curveMonotoneY);

      const path = g
        .append("path")
        .datum(paramData)
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", param.color)
        .style("stroke-width", 2)
        .style("stroke-linejoin", "round")
        .style("stroke-linecap", "round")
        .style("opacity", 0.85);

      // Animation
      const pathLength = path.node()?.getTotalLength() || 0;
      path
        .attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(1500)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);
    }

    // Legend
    const legendX = innerWidth - availableParams.length * 110;
    const legend = g
      .append("g")
      .attr("transform", `translate(${Math.max(0, legendX)}, ${innerHeight + 30})`);

    availableParams.forEach((param, i) => {
      const item = legend.append("g").attr("transform", `translate(${i * 110}, 0)`);

      item
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 20)
        .attr("y2", 0)
        .style("stroke", param.color)
        .style("stroke-width", 2.5);

      item
        .append("text")
        .attr("x", 25)
        .attr("y", 4)
        .style("font-size", "11px")
        .style("fill", "currentColor")
        .text(`${param.label} (${param.unit})`);
    });

    // Crosshair
    const crosshair = g
      .append("line")
      .attr("class", "crosshair")
      .style("stroke", "#666")
      .style("stroke-width", 1)
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0);

    // Mouse interaction area
    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", function (event) {
        const mouseY = d3.pointer(event, this)[1];
        const yValue = yScale.invert(mouseY);
        const closest = data.reduce((prev, curr) =>
          Math.abs(curr.pressure - yValue) < Math.abs(prev.pressure - yValue) ? curr : prev,
        );

        // Update crosshair
        crosshair
          .attr("x1", 0)
          .attr("x2", innerWidth)
          .attr("y1", yScale(closest.pressure))
          .attr("y2", yScale(closest.pressure))
          .style("opacity", 1);

        // Update tooltip
        let tooltipContent = `Pressure: ${closest.pressure.toFixed(1)} dbar`;
        if (closest.temperature != null)
          tooltipContent += `<br>Temp: ${closest.temperature.toFixed(2)} °C`;
        if (closest.salinity != null)
          tooltipContent += `<br>Sal: ${closest.salinity.toFixed(2)} PSU`;
        if (closest.oxygen != null)
          tooltipContent += `<br>Oxygen: ${closest.oxygen.toFixed(2)} μmol/kg`;
        if (closest.chlorophyll != null)
          tooltipContent += `<br>Chl-a: ${closest.chlorophyll.toFixed(2)} mg/m³`;
        if (closest.nitrate != null)
          tooltipContent += `<br>Nitrate: ${closest.nitrate.toFixed(2)} μmol/kg`;

        tooltip
          .style("visibility", "visible")
          .html(tooltipContent)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", () => {
        crosshair.style("opacity", 0);
        tooltip.style("visibility", "hidden");
      });
  }, [data, width, height]);

  return (
    <div className="p-6 rounded-lg overflow-hidden">
      <svg ref={svgRef} width={width} height={height} className="overflow-visible w-full h-full" />
    </div>
  );
}
