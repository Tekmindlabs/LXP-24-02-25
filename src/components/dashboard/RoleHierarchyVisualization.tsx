"use client";

import { useEffect, useRef } from 'react';
import { select, stratify, tree, HierarchyNode, HierarchyLink, linkHorizontal } from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';

interface Role {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  permissions: string[];
}

interface RoleNode extends HierarchyNode<Role> {
  x: number;
  y: number;
}

interface RoleHierarchyVisualizationProps {
  roles: Role[];
  width?: number;
  height?: number;
}

export function RoleHierarchyVisualization({
  roles,
  width = 800,
  height = 600
}: RoleHierarchyVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !roles.length) return;

    // Clear previous visualization
    select(svgRef.current).selectAll('*').remove();

    // Create hierarchy
    const hierarchy = stratify<Role>()
      .id((d: Role) => d.id)
      .parentId((d: Role) => d.parentId)
      (roles);

    // Create tree layout
    const treeLayout = tree<Role>()
      .size([width - 100, height - 100]);

    const root = treeLayout(hierarchy);

    // Create SVG
    const svg = select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(50, 50)`);

    // Draw links
    svg.selectAll('path.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#999')
      .attr('d', linkHorizontal<any, any>()
        .x((d) => d.source.y)
        .y((d) => d.source.x)
        .source((d) => d.source)
        .target((d) => d.target)
      );

    // Draw nodes
    const nodes = svg.selectAll('g.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: RoleNode) => `translate(${d.y},${d.x})`)
      .attr('data-tip', (d: RoleNode) => `${d.data.name}\nPermissions: ${d.data.permissions.join(', ')}`);

    // Add circles for nodes
    nodes.append('circle')
      .attr('r', 5)
      .attr('fill', '#4f46e5')
      .attr('stroke', '#312e81')
      .attr('stroke-width', 2);

    // Add labels
    nodes.append('text')
      .attr('dx', (d: RoleNode) => d.children ? -8 : 8)
      .attr('dy', 3)
      .attr('text-anchor', (d: RoleNode) => d.children ? 'end' : 'start')
      .text((d: RoleNode) => d.data.name)
      .attr('font-size', '12px')
      .attr('fill', '#1f2937');

  }, [roles, width, height]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Hierarchy</CardTitle>
      </CardHeader>
      <CardContent>
        <svg ref={svgRef} />
      </CardContent>
    </Card>
  );
}