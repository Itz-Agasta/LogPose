"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import type { ProfileMeasurement } from "@LogPose/schema/api/profile";

interface TemperatureSalinityDiagramProps {
  data: ProfileMeasurement[];
  width?: number;
  height?: number;
}

export function TemperatureSalinityDiagram({
  data,
  width = 500,
  height = 400,
}: TemperatureSalinityDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Clean up any existing tooltips
    d3.select(containerRef.current).selectAll(".tooltip").remove();

    // Setup Tooltip
    const tooltip = d3
      .select(containerRef.current)
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

    const margin = { top: 40, right: 80, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Sort data by pressure for animation (surface to deep)
    const sortedData = [...data].sort((a, b) => a.pressure - b.pressure);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Define Clip Path
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "chart-clip")
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(sortedData, (d) => d.salinity) as [number, number])
      .range([0, innerWidth])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(sortedData, (d) => d.temperature) as [number, number])
      .range([innerHeight, 0])
      .nice();

    // Color scale based on pressure (depth)
    const colorScale = d3
      .scaleSequential(d3.interpolateViridis)
      .domain(d3.extent(sortedData, (d) => d.pressure) as [number, number]);

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".1f")).ticks(8);
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".1f")).ticks(6);

    const xAxisGroup = g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    const yAxisGroup = g.append("g").attr("class", "y-axis").call(yAxis);

    // Apply initial styles
    xAxisGroup.selectAll("text").style("font-size", "12px").style("fill", "currentColor");
    yAxisGroup.selectAll("text").style("font-size", "12px").style("fill", "currentColor");
    g.selectAll(".domain, .tick line")
      .style("stroke", "currentColor")
      .style("stroke-width", 1)
      .style("opacity", 0.3);

    // Grid lines
    const makeXGrid = () =>
      d3
        .axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(() => "");
    const makeYGrid = () =>
      d3
        .axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => "");

    const xGrid = g
      .append("g")
      .attr("class", "grid x-grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(makeXGrid())
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.15);

    const yGrid = g
      .append("g")
      .attr("class", "grid y-grid")
      .call(makeYGrid())
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.15);

    // Data points Group with Clip Path
    const pointsGroup = g.append("g").attr("clip-path", "url(#chart-clip)");

    // Data points
    const points = pointsGroup
      .selectAll(".data-point")
      .data(sortedData)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", (d) => xScale(d.salinity))
      .attr("cy", (d) => yScale(d.temperature))
      .attr("r", 0)
      .style("fill", (d) => colorScale(d.pressure))
      .style("stroke", "white")
      .style("stroke-width", 0.5)
      .style("opacity", 0.8)
      .style("cursor", "crosshair");

    // Animate points entrance (Top to Down / Surface to Deep)
    points
      .transition()
      .duration(750)
      .delay((_, i) => i * 2)
      .attr("r", 4);

    // Tooltip Interaction
    points
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", 8)
          .style("stroke-width", 2)
          .style("opacity", 1);

        tooltip.style("visibility", "visible").html(`
          <div class="font-semibold border-b border-gray-600 pb-1 mb-1 text-xs">Measurement Data</div>
          <div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
            <span class="text-gray-400">Salinity:</span>
            <span class="font-mono">${d.salinity.toFixed(3)} PSU</span>
            <span class="text-gray-400">Temp:</span>
            <span class="font-mono">${d.temperature.toFixed(3)} °C</span>
            <span class="text-gray-400">Pressure:</span>
            <span class="font-mono">${d.pressure.toFixed(1)} dbar</span>
          </div>
        `);
      })
      .on("mousemove", function (event) {
        const [x, y] = d3.pointer(event, containerRef.current);
        tooltip.style("top", `${y - 10}px`).style("left", `${x + 15}px`);
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", 4)
          .style("stroke-width", 0.5)
          .style("opacity", 0.8);
        tooltip.style("visibility", "hidden");
      });

    // Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 20])
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      .on("zoom", (event) => {
        const newXScale = event.transform.rescaleX(xScale);
        const newYScale = event.transform.rescaleY(yScale);

        // Update Axes
        xAxisGroup.call(xAxis.scale(newXScale));
        yAxisGroup.call(yAxis.scale(newYScale));

        // Update Grid
        xGrid.call(
          d3
            .axisBottom(newXScale)
            .tickSize(-innerHeight)
            .tickFormat(() => ""),
        );
        yGrid.call(
          d3
            .axisLeft(newYScale)
            .tickSize(-innerWidth)
            .tickFormat(() => ""),
        );

        // Re-apply styles after axis redraw
        xAxisGroup.selectAll("text").style("font-size", "12px").style("fill", "currentColor");
        yAxisGroup.selectAll("text").style("font-size", "12px").style("fill", "currentColor");
        g.selectAll(".domain, .tick line")
          .style("stroke", "currentColor")
          .style("stroke-width", 1)
          .style("opacity", 0.3);
        xGrid.style("stroke-dasharray", "2,2").style("opacity", 0.15);
        yGrid.style("stroke-dasharray", "2,2").style("opacity", 0.15);

        // Update Points
        points.attr("cx", (d) => newXScale(d.salinity)).attr("cy", (d) => newYScale(d.temperature));
      });

    // Attach Zoom
    svg
      .call(zoom)
      .on("dblclick.zoom", () =>
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity),
      );

    // Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "currentColor")
      .text("Temperature-Salinity Diagram");

    // Axis labels
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", -(height / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "currentColor")
      .text("Temperature (°C)");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "currentColor")
      .text("Salinity (PSU)");

    // Color legend
    const legendHeight = 200;
    const legendWidth = 20;
    const legend = svg.append("g").attr("transform", `translate(${width - 80}, ${margin.top})`);

    const legendScale = d3.scaleLinear().domain(colorScale.domain()).range([0, legendHeight]);

    const legendAxis = d3
      .axisRight(legendScale)
      .tickFormat((d) => `${d}m`)
      .ticks(5);

    const legendGradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", legendHeight);

    const colorRange = d3.range(0, 1.01, 0.01);
    legendGradient
      .selectAll("stop")
      .data(colorRange)
      .enter()
      .append("stop")
      .attr("offset", (d) => `${d * 100}%`)
      .attr("stop-color", (d) => colorScale(legendScale.invert(d * legendHeight)));

    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    legend
      .append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "currentColor");

    legend
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -10)
      .attr("x", -legendHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "currentColor")
      .text("Pressure (dbar)");
  }, [data, width, height]);

  return (
    <div ref={containerRef} className="p-6 rounded-lg overflow-hidden relative">
      <svg ref={svgRef} width={width} height={height} className="overflow-visible w-full h-full" />
    </div>
  );
}
