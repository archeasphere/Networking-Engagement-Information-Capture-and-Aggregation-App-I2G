import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

const GraphVisualization = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Sample data
  const files = [
    { id: 'f1', name: 'Project Docs.pdf', type: 'file', labels: ['l1', 'l2'] },
    { id: 'f2', name: 'Design Mockups.png', type: 'file', labels: ['l2'] },
    { id: 'f3', name: 'App Code.zip', type: 'file', labels: ['l3'] },
    { id: 'f4', name: 'Meeting Notes.txt', type: 'file', labels: ['l1', 'l3'] }
  ];
  
  const labels = [
    { id: 'l1', name: 'Important', type: 'label', color: '#FF6B6B' },
    { id: 'l2', name: 'Work', type: 'label', color: '#4ECDC4' },
    { id: 'l3', name: 'Project', type: 'label', color: '#FFD166' }
  ];
  
  // Calculate positions in a force-directed layout
  useEffect(() => {
    // Create nodes
    const labelNodes = labels.map((label, index) => ({
      id: label.id,
      x: Math.cos(index * (2 * Math.PI / labels.length)) * 120 + 150,
      y: Math.sin(index * (2 * Math.PI / labels.length)) * 120 + 150,
      radius: 30,
      data: label
    }));
    
    // Position files in clusters around their labels
    const fileNodes = files.map((file, index) => {
      // Calculate average position based on connected labels
      const connectedLabels = file.labels.map(labelId => 
        labelNodes.find(node => node.id === labelId)
      ).filter(Boolean);
      
      let avgX = 0, avgY = 0;
      
      if (connectedLabels.length > 0) {
        avgX = connectedLabels.reduce((sum, node) => sum + node.x, 0) / connectedLabels.length;
        avgY = connectedLabels.reduce((sum, node) => sum + node.y, 0) / connectedLabels.length;
      } else {
        // If no labels, place in the center with some randomness
        avgX = 150 + (Math.random() * 50 - 25);
        avgY = 150 + (Math.random() * 50 - 25);
      }
      
      // Add some randomness to avoid exact overlaps
      const randOffsetX = Math.random() * 40 - 20;
      const randOffsetY = Math.random() * 40 - 20;
      
      return {
        id: file.id,
        x: avgX + randOffsetX,
        y: avgY + randOffsetY,
        radius: 20,
        data: file
      };
    });
    
    // Combine all nodes
    setNodes([...labelNodes, ...fileNodes]);
    
    // Create edges between files and their labels
    const connectionEdges = [];
    files.forEach(file => {
      file.labels.forEach(labelId => {
        connectionEdges.push({
          id: `${file.id}-${labelId}`,
          source: file.id,
          target: labelId
        });
      });
    });
    
    setEdges(connectionEdges);
  }, []);
  
  const handleNodePress = (node) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>File-Label Relationship Graph</ThemedText>
      </View>
      
      <View style={styles.graphContainer}>
        {/* Draw edges first so they appear behind nodes */}
        {edges.map(edge => {
          const sourceNode = nodes.find(node => node.id === edge.source);
          const targetNode = nodes.find(node => node.id === edge.target);
          
          if (!sourceNode || !targetNode) return null;
          
          // Highlight edges connected to the selected node
          const isHighlighted = selectedNode && 
            (selectedNode.id === edge.source || selectedNode.id === edge.target);
          
          return (
            <View
              key={edge.id}
              style={[
                styles.edge,
                {
                  left: Math.min(sourceNode.x, targetNode.x),
                  top: Math.min(sourceNode.y, targetNode.y),
                  width: Math.abs(targetNode.x - sourceNode.x),
                  height: Math.abs(targetNode.y - sourceNode.y),
                  backgroundColor: 'transparent',
                },
                isHighlighted && styles.highlightedEdge
              ]}
            >
              <View
                style={[
                  styles.line,
                  {
                    width: Math.sqrt(
                      Math.pow(targetNode.x - sourceNode.x, 2) + 
                      Math.pow(targetNode.y - sourceNode.y, 2)
                    ),
                    transform: [
                      {
                        rotate: `${Math.atan2(
                          targetNode.y - sourceNode.y,
                          targetNode.x - sourceNode.x
                        )}rad`,
                      },
                    ],
                    backgroundColor: isHighlighted ? '#3A6FF7' : '#D0D0D0',
                  },
                ]}
              />
            </View>
          );
        })}
        
        {/* Draw nodes */}
        {nodes.map(node => {
          const isLabel = node.data.type === 'label';
          const isHighlighted = selectedNode && 
            (selectedNode.id === node.id || 
             edges.some(edge => 
               (edge.source === selectedNode.id && edge.target === node.id) || 
               (edge.target === selectedNode.id && edge.source === node.id)
             ));
          
          return (
            <TouchableOpacity
              key={node.id}
              style={[
                styles.node,
                {
                  left: node.x - node.radius,
                  top: node.y - node.radius,
                  width: node.radius * 2,
                  height: node.radius * 2,
                  backgroundColor: isLabel 
                    ? node.data.color 
                    : (isHighlighted ? '#E9F2FF' : '#F0F0F0'),
                  borderColor: isHighlighted ? '#3A6FF7' : '#E0E0E0',
                  borderWidth: isHighlighted ? 2 : 1,
                },
                isLabel && styles.labelNode,
                node.id === selectedNode?.id && styles.selectedNode
              ]}
              onPress={() => handleNodePress(node)}
            >
              {isLabel ? (
                <Ionicons name="pricetag-outline" size={16} color="#FFFFFF" />
              ) : (
                <Ionicons 
                  name="document-outline" 
                  size={16} 
                  color={isHighlighted ? '#3A6FF7' : '#707070'} 
                />
              )}
              <ThemedText 
                style={[
                  styles.nodeText, 
                  isLabel && styles.labelText,
                  isHighlighted && !isLabel && styles.highlightedText
                ]}
                numberOfLines={1}
              >
                {node.data.name.length > 10 
                  ? node.data.name.substring(0, 8) + '...' 
                  : node.data.name}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Info panel for selected node */}
      {selectedNode && (
        <View style={styles.infoPanel}>
          <ThemedText style={styles.infoPanelTitle}>
            {selectedNode.data.type === 'label' ? 'Label' : 'File'}: {selectedNode.data.name}
          </ThemedText>
          
          {selectedNode.data.type === 'label' ? (
            <View>
              <ThemedText style={styles.infoPanelSubtitle}>Connected Files:</ThemedText>
              {files
                .filter(file => file.labels.includes(selectedNode.id))
                .map(file => (
                  <ThemedText key={file.id} style={styles.infoPanelItem}>
                    • {file.name}
                  </ThemedText>
                ))}
            </View>
          ) : (
            <View>
              <ThemedText style={styles.infoPanelSubtitle}>Labels:</ThemedText>
              {selectedNode.data.labels.map(labelId => {
                const label = labels.find(l => l.id === labelId);
                return label ? (
                  <View key={labelId} style={styles.labelItem}>
                    <View 
                      style={[
                        styles.labelColorDot, 
                        { backgroundColor: label.color }
                      ]} 
                    />
                    <ThemedText style={styles.infoPanelItem}>
                      {label.name}
                    </ThemedText>
                  </View>
                ) : null;
              })}
            </View>
          )}
        </View>
      )}
      
      <View style={styles.legend}>
        <ThemedText style={styles.legendTitle}>Legend:</ThemedText>
        {labels.map(label => (
          <View key={label.id} style={styles.legendItem}>
            <View 
              style={[styles.legendColorDot, { backgroundColor: label.color }]} 
            />
            <ThemedText style={styles.legendText}>{label.name}</ThemedText>
          </View>
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333'
  },
  graphContainer: {
    height: 300,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    position: 'relative'
  },
  edge: {
    position: 'absolute',
    overflow: 'visible'
  },
  line: {
    height: 1,
    position: 'absolute',
    transformOrigin: 'left center'
  },
  highlightedEdge: {
    zIndex: 1
  },
  node: {
    position: 'absolute',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    zIndex: 2
  },
  labelNode: {
    borderWidth: 0
  },
  selectedNode: {
    borderWidth: 2,
    borderColor: '#3A6FF7',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4
  },
  nodeText: {
    fontSize: 10,
    color: '#333333',
    marginTop: 2
  },
  labelText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  highlightedText: {
    color: '#3A6FF7'
  },
  infoPanel: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  infoPanelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333'
  },
  infoPanelSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#555555'
  },
  infoPanelItem: {
    fontSize: 14,
    marginBottom: 2,
    color: '#666666'
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  labelColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  legend: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  legendColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  legendText: {
    fontSize: 12,
    color: '#666666'
  }
});

export default GraphVisualization;