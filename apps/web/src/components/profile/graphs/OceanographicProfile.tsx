"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import type { ProfileMeasurement } from "@LogPose/schema/api/profile";

type MeasurementKey = "temperature" | "salinity" | "oxygen" | "chlorophyll" | "nitrate";

interface OceanographicProfileProps {
  data: ProfileMeasurement[];
  parameter: MeasurementKey;
  title: string;
  unit: string;
  color: string;
  width?: number;
  height?: number;
}

export function OceanographicProfile({
  data,
  parameter,
  title,
  unit,
  color,
  width = 400,
  height = 500,
}: OceanographicProfileProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length || !containerRef.current) return;

    // Filter out null values for optional parameters
    const filteredData = data.filter((d) => {
      const val = d[parameter];
      return val != null;
    });

    if (!filteredData.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Clean up tooltips
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

    const margin = { top: 40, right: 60, bottom: 60, left: 80 };
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
      .text(title);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Create separate groups for ordering: grid < area < line < points < axis < overlay
    const gridGroup = g.append("g").attr("class", "grid-group");
    const contentGroup = g.append("g").attr("class", "content-group");
    const axisGroup = g.append("g").attr("class", "axis-group");
    const overlayGroup = g.append("g").attr("class", "overlay-group");

    // Clip Path
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", `profile-clip-${parameter}`)
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    contentGroup.attr("clip-path", `url(#profile-clip-${parameter})`);

    // Scales — pressure (depth) on Y-axis, parameter on X-axis
    const xExtent = d3.extent(filteredData, (d) => Number(d[parameter])) as [number, number];
    // Add some padding to x-domain
    const xPadding = (xExtent[1] - xExtent[0]) * 0.05;
    const xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, innerWidth])
      .nice();

    const yExtent = d3.extent(filteredData, (d) => d.pressure) as [number, number];
    const yScale = d3.scaleLinear().domain(yExtent).range([0, innerHeight]); // Depth increases downward

    // Zoom setup
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 20])
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      // Restrict zoom/pan to Y axis mostly if preferred, but allowing both is standard
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

        // Style fixes
        xAxisGroup.selectAll("text").style("font-size", "12px").style("fill", "currentColor");
        yAxisGroup.selectAll("text").style("font-size", "12px").style("fill", "currentColor");
        axisGroup
          .selectAll(".domain, .tick line")
          .style("stroke", "currentColor")
          .style("opacity", 0.3);
        gridGroup.selectAll(".domain").remove();
        gridGroup.selectAll("line").style("stroke-dasharray", "2,2").style("opacity", 0.15);

        // Update Area and Line
        const newLine = d3
          .line<ProfileMeasurement>()
          .x((d) => newXScale(Number(d[parameter])))
          .y((d) => newYScale(d.pressure))
          .curve(d3.curveMonotoneY);

        const newArea = d3
          .area<ProfileMeasurement>()
          .y((d) => newYScale(d.pressure))
          .x0(newXScale(0) < 0 ? 0 : newXScale(0)) // careful with negative mapping if any
          .x0(0) // Stick to left edge? No, x0 should be newXScale(0) usually if we want to fill to 0 value.
          // But for profile plots users often just want filling to the "left" of frame or to 0.
          // Let's use newXScale.range()[0] (0) for "left of graph" fill effect
          // OR newXScale(xExtent[0]) if we want fill to min value.
          // Let's stick to fill-to-axis (0 screen coord) for visual clarity.
          .x0(0)
          .x1((d) => newXScale(Number(d[parameter])))
          .curve(d3.curveMonotoneY);

        profilePath.attr("d", newLine);
        areaPath.attr("d", newArea);

        // Update Points
        points
          .attr("cx", (d) => newXScale(Number(d[parameter])))
          .attr("cy", (d) => newYScale(d.pressure));

        // Update focus tracker scales
        // We need to update the scales used by mousemove
        // We can't easily update the closure variables, so we attach them to the rect or use a ref
        overlayRect.property("__scales", { x: newXScale, y: newYScale });
      });

    // Attach zoom
    svg
      .call(zoom)
      .on("dblclick.zoom", () =>
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity),
      );

    // Line generator
    const line = d3
      .line<ProfileMeasurement>()
      .x((d) => xScale(Number(d[parameter])))
      .y((d) => yScale(d.pressure))
      .curve(d3.curveMonotoneY);

    // Gradient
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", `gradient-${parameter}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", innerHeight);

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.8);
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.2);

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".2f")).ticks(6);
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => `${d}m`)
      .ticks(8);

    const xAxisGroup = axisGroup
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    const yAxisGroup = axisGroup.append("g").attr("class", "y-axis").call(yAxis);

    xAxisGroup.selectAll("text").style("font-size", "12px").style("fill", "currentColor");
    yAxisGroup.selectAll("text").style("font-size", "12px").style("fill", "currentColor");
    axisGroup
      .selectAll(".domain, .tick line")
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

    const xGrid = gridGroup
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(makeXGrid())
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.15);

    const yGrid = gridGroup
      .append("g")
      .attr("class", "grid")
      .call(makeYGrid())
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.15);

    // Area under line
    // Changed to properly fill horizontal profile
    const area = d3
      .area<ProfileMeasurement>()
      .y((d) => yScale(d.pressure))
      .x0(0)
      .x1((d) => xScale(Number(d[parameter])))
      .curve(d3.curveMonotoneY);

    const areaPath = contentGroup
      .append("path")
      .datum(filteredData)
      .attr("class", "profile-area")
      .attr("d", area)
      .style("fill", `url(#gradient-${parameter})`)
      .style("opacity", 0); // Start invisible for animation

    // Profile line
    const profilePath = contentGroup
      .append("path")
      .datum(filteredData)
      .attr("class", "profile-line")
      .attr("d", line)
      .style("fill", "none")
      .style("stroke", color)
      .style("stroke-width", 2.5)
      .style("stroke-linejoin", "round")
      .style("stroke-linecap", "round");

    // Animate Line and Area
    const pathLength = profilePath.node()?.getTotalLength() || 0;

    profilePath
      .attr("stroke-dasharray", pathLength)
      .attr("stroke-dashoffset", pathLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    areaPath.transition().delay(500).duration(1500).style("opacity", 0.3);

    // Data points (every 5th)
    const points = contentGroup
      .selectAll(".data-point")
      .data(filteredData.filter((_, i) => i % 5 === 0))
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", (d) => xScale(Number(d[parameter])))
      .attr("cy", (d) => yScale(d.pressure))
      .attr("r", 0) // Start 0 size
      .style("fill", color)
      .style("stroke", "white")
      .style("stroke-width", 1.5)
      .style("opacity", 0.8);

    points
      .transition()
      .delay((d, i) => 1000 + i * 10) // Stagger after line starts
      .duration(500)
      .attr("r", 3);

    // Interaction Overlay
    const focus = overlayGroup.append("g").style("display", "none");

    focus
      .append("circle")
      .attr("r", 5)
      .style("fill", color)
      .style("stroke", "#fff")
      .style("stroke-width", 2);

    focus
      .append("line")
      .attr("class", "x-hover-line")
      .style("stroke", color)
      .style("stroke-width", 1)
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);

    focus
      .append("line")
      .attr("class", "y-hover-line") // Horizontal line for depth
      .style("stroke", color)
      .style("stroke-width", 1)
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);

    const overlayRect = overlayGroup
      .append("rect")
      .attr("class", "overlay")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .property("__scales", { x: xScale, y: yScale }) // Initial scales
      .on("mouseover", () => {
        focus.style("display", null);
        tooltip.style("visibility", "visible");
      })
      .on("mouseout", () => {
        focus.style("display", "none");
        tooltip.style("visibility", "hidden");
      })
      .on("mousemove", (event) => {
        // Retrieve current scales (handling zoom)
        const scales = d3.select(event.currentTarget).property("__scales");
        const currentXScale = scales.x;
        const currentYScale = scales.y;

        const [, mouseY] = d3.pointer(event, g.node() as any);
        const y0 = currentYScale.invert(mouseY);

        // Bisect to find nearest point by pressure (monotonic-ish)
        // filteredData is time-series like profile? Usually sorted by pressure?
        // If not sorted, we should sort. Measurements usually come sorted by depth.
        // Let's assume sorted by pressure for optimization, or sort it.
        // const sortedData = filteredData.sort((a,b) => a.pressure - b.pressure); // assume sorted or sort once outside

        const bisectY = d3.bisector<ProfileMeasurement, number>((d) => d.pressure).left;
        const i = bisectY(filteredData, y0, 1);
        const d0 = filteredData[i - 1];
        const d1 = filteredData[i];

        let d = d0;
        if (d0 && d1) {
          d = y0 - d0.pressure > d1.pressure - y0 ? d1 : d0;
        } else if (!d0 && d1) d = d1;

        if (!d) return;

        const px = currentXScale(Number(d[parameter]));
        const py = currentYScale(d.pressure);

        focus.attr("transform", `translate(${px},${py})`);

        focus
          .select(".x-hover-line")
          .attr("y1", 0)
          .attr("y2", innerHeight - py); // Down to bottom? Or full height?
        // Let's extend to axis?
        // Actually crosshair style is better
        // x-hover-line: vertical line
        // y-hover-line: horizontal line

        focus
          .select(".x-hover-line")
          .attr("y1", -py) // Top of chart relative to point
          .attr("y2", innerHeight - py); // Bottom of chart relative to point

        focus
          .select(".y-hover-line")
          .attr("x1", -px)
          .attr("x2", innerWidth - px);

        tooltip
          .style("top", `${event.offsetY - 40}px`) // relative to container
          .style("left", `${event.offsetX + 20}px`).html(`
                <div class="font-bold text-xs mb-1">${title}</div>
                <div class="text-xs">
                  <span class="text-gray-400">Depth:</span>
                  <span class="font-mono ml-1">${d.pressure.toFixed(1)}m</span>
                </div>
                <div class="text-xs">
                  <span class="text-gray-400">Value:</span>
                  <span class="font-mono ml-1">${Number(d[parameter]).toFixed(3)} ${unit}</span>
                </div>
              `);
      });

    // Axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("fill", "currentColor")
      .text(`${title} (${unit})`);

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 16)
      .attr("x", -(height / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("fill", "currentColor")
      .text("Pressure (dbar)");
  }, [data, parameter, title, unit, color, width, height]);

  return (
    <div ref={containerRef} className="p-6 rounded-lg overflow-hidden relative">
      <svg ref={svgRef} width={width} height={height} className="overflow-visible w-full h-full" />
    </div>
  );
}
