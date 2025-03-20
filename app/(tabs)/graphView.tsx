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
  
  // Selected file (first file by default)
  const centralFile = files[0];
  
  // Calculate node positions with central file and radiating labels
  useEffect(() => {
    const windowWidth = Dimensions.get('window').width;
    const containerWidth = windowWidth - 32; // Accounting for container padding
    const containerHeight = 300; // Height of the graph container
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const radius = Math.min(centerX, centerY) - 50; // Safe radius for label nodes
    
    // Create central file node
    const fileNode = {
      id: centralFile.id,
      x: centerX,
      y: centerY,
      radius: 35, // Slightly larger central node
      data: centralFile
    };
    
    // Get only the labels related to this file
    const relatedLabelIds = centralFile.labels;
    const relatedLabels = labels.filter(label => relatedLabelIds.includes(label.id));
    
    // Position labels in a circle around the central file
    const labelNodes = relatedLabels.map((label, index) => {
      const angle = index * (2 * Math.PI / relatedLabels.length);
      
      return {
        id: label.id,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 30,
        data: label
      };
    });
    
    // Combine central file node with label nodes
    setNodes([fileNode, ...labelNodes]);
    
    // Create edges between the central file and its labels
    const connectionEdges = relatedLabelIds.map(labelId => ({
      id: `${centralFile.id}-${labelId}`,
      source: centralFile.id,
      target: labelId
    }));
    
    setEdges(connectionEdges);
  }, []);
  
  const handleNodePress = (node) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };
  
  // Find files related to a label
  const getFilesForLabel = (labelId) => {
    return files.filter(file => file.labels.includes(labelId));
  };
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>File-Label Relationship Graph</ThemedText>
      </View>
      
      <View style={styles.graphContainer}>
        {/* Draw edges with improved alignment */}
        {edges.map(edge => {
          const sourceNode = nodes.find(node => node.id === edge.source);
          const targetNode = nodes.find(node => node.id === edge.target);
          
          if (!sourceNode || !targetNode) return null;
          
          // Calculate line endpoints using node positions and radii
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Unit vector for direction
          const ux = dx / distance;
          const uy = dy / distance;
          
          // Adjust start and end points to be at the node boundaries
          const startX = sourceNode.x + (ux * sourceNode.radius);
          const startY = sourceNode.y + (uy * sourceNode.radius);
          const endX = targetNode.x - (ux * targetNode.radius);
          const endY = targetNode.y - (uy * targetNode.radius);
          
          // Recalculate adjusted distance for the line
          const adjustedDx = endX - startX;
          const adjustedDy = endY - startY;
          const adjustedDistance = Math.sqrt(adjustedDx * adjustedDx + adjustedDy * adjustedDy);
          const angle = Math.atan2(adjustedDy, adjustedDx);
          
          // Highlight edges connected to the selected node
          const isHighlighted = selectedNode && 
            (selectedNode.id === edge.source || selectedNode.id === edge.target);
          
          return (
            <View
              key={edge.id}
              style={[
                styles.edge,
                {
                  left: startX,
                  top: startY,
                  width: adjustedDistance,
                  height: 2, // Line thickness
                  transform: [{ rotate: `${angle}rad` }],
                  backgroundColor: isHighlighted ? '#3A6FF7' : '#D0D0D0',
                  zIndex: 1,
                  position: 'absolute',
                  transformOrigin: '0 0',
                },
              ]}
            />
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
                node.id === selectedNode?.id && styles.selectedNode,
                // Central file node is larger
                !isLabel && styles.fileNode
              ]}
              onPress={() => handleNodePress(node)}
            >
              {isLabel ? (
                <Ionicons name="pricetag-outline" size={16} color="#FFFFFF" />
              ) : (
                <Ionicons 
                  name="document-outline" 
                  size={20} 
                  color={isHighlighted ? '#3A6FF7' : '#707070'} 
                />
              )}
              <ThemedText 
                style={[
                  styles.nodeText, 
                  isLabel && styles.labelText,
                  isHighlighted && !isLabel && styles.highlightedText,
                  !isLabel && styles.fileNodeText
                ]}
                numberOfLines={1}
              >
                {isLabel ? node.data.name : node.data.name.length > 12 
                  ? node.data.name.substring(0, 10) + '...' 
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
              {getFilesForLabel(selectedNode.id).map(file => (
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
    height: 2,
    backgroundColor: '#D0D0D0',
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
  fileNode: {
    zIndex: 3,
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3
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
  fileNodeText: {
    fontSize: 12,
    fontWeight: '500'
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
  }
});

export default GraphVisualization;