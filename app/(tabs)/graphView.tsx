import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

const GraphVisualization = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFocusedView, setIsFocusedView] = useState(false);
  const [hoveredEdge, setHoveredEdge] = useState(null);

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

  useEffect(() => {
    const windowWidth = Dimensions.get('window').width;
    const containerWidth = windowWidth - 32;
    const containerHeight = 300;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const radius = Math.min(centerX, centerY) - 50;

    const labelNodes = labels.map((label, index) => {
      const angle = index * (2 * Math.PI / labels.length);
      return {
        id: label.id,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 30,
        data: label
      };
    });

    setNodes(labelNodes);
    setEdges([]);
  }, []);

  const handleNodePress = (node) => {
    const isSelected = selectedNode?.id === node.id;
    if (node.data.type === 'label') {
      if (isFocusedView && isSelected) return;

      setIsFocusedView(true);
      setSelectedNode(node);

      const windowWidth = Dimensions.get('window').width;
      const containerWidth = windowWidth - 32;
      const centerX = containerWidth / 2;
      const centerY = 150;

      const centerLabelNode = {
        ...node,
        x: centerX,
        y: centerY
      };

      const relatedFiles = files.filter(f => f.labels.includes(node.id));

      const fileNodes = relatedFiles.map((file, index) => {
        const angle = index * (2 * Math.PI / relatedFiles.length);
        const radius = 80;

        return {
          id: file.id,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          radius: 25,
          data: file
        };
      });

      const newEdges = relatedFiles.map(file => ({
        id: `${node.id}-${file.id}`,
        source: node.id,
        target: file.id
      }));

      setNodes([centerLabelNode, ...fileNodes]);
      setEdges(newEdges);
    }
  };

  const handleBackPress = () => {
    setIsFocusedView(false);
    setSelectedNode(null);

    const windowWidth = Dimensions.get('window').width;
    const containerWidth = windowWidth - 32;
    const containerHeight = 300;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const radius = Math.min(centerX, centerY) - 50;

    const labelNodes = labels.map((label, index) => {
      const angle = index * (2 * Math.PI / labels.length);
      return {
        id: label.id,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 30,
        data: label
      };
    });

    setNodes(labelNodes);
    setEdges([]);
  };

  const getFilesForLabel = (labelId) => {
    return files.filter(file => file.labels.includes(labelId));
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>File-Label Relationship Graph</ThemedText>
      </View>

      <View style={styles.graphContainer}>
        {isFocusedView && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#3A6FF7" />
            <ThemedText style={styles.backText}>Back to Labels</ThemedText>
          </TouchableOpacity>
        )}

        {edges.map(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / dist;
          const uy = dy / dist;

          const startX = sourceNode.x + ux * sourceNode.radius;
          const startY = sourceNode.y + uy * sourceNode.radius;
          const endX = targetNode.x - ux * targetNode.radius;
          const endY = targetNode.y - uy * targetNode.radius;

          const relatedFiles = !isFocusedView ? getFilesForLabel(sourceNode.id) : [];

          return (
            <TouchableOpacity
              key={edge.id}
              activeOpacity={1}
              onMouseEnter={() => setHoveredEdge(edge)}
              onMouseLeave={() => setHoveredEdge(null)}
              style={[
                styles.edge,
                {
                  left: startX,
                  top: startY,
                  width: Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2),
                  transform: [{ rotate: `${Math.atan2(endY - startY, endX - startX)}rad` }],
                  backgroundColor: '#000',
                  zIndex: hoveredEdge?.id === edge.id ? 5 : 1
                }
              ]}
            >
              {!isFocusedView && hoveredEdge?.id === edge.id && (
                <View style={styles.tooltip}>
                  {relatedFiles.map(file => (
                    <ThemedText key={file.id} style={styles.tooltipText}>
                      • {file.name}
                    </ThemedText>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {nodes.map(node => {
          const isLabel = node.data.type === 'label';
          const isHovered = hoveredEdge?.source === node.id || hoveredEdge?.target === node.id;
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
                  backgroundColor: isHovered ? '#D3D3D3' : (isLabel ? node.data.color : '#F0F0F0'),
                  borderColor: selectedNode?.id === node.id ? '#3A6FF7' : '#E0E0E0',
                  borderWidth: selectedNode?.id === node.id ? 2 : 1,
                  cursor: 'pointer'
                }
              ]}
              onPress={() => handleNodePress(node)}
            >
              {isLabel ? (
                <Ionicons name="pricetag-outline" size={16} color="#FFF" />
              ) : (
                <Ionicons name="document-outline" size={20} color="#707070" />
              )}
              <ThemedText style={[styles.nodeText, isLabel && styles.labelText]} numberOfLines={1}>
                {node.data.name.length > 12 ? node.data.name.slice(0, 10) + '...' : node.data.name}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search files or labels..."
          placeholderTextColor="#999"
        />
      </View>

      {selectedNode && (
        <View style={styles.infoPanel}>
          <ThemedText style={styles.infoPanelTitle}>
            {selectedNode.data.type === 'label' ? 'Label' : 'File'}: {selectedNode.data.name}
          </ThemedText>
          {selectedNode.data.type === 'label' && (
            <>
              <ThemedText style={styles.infoPanelSubtitle}>Connected Files:</ThemedText>
              {getFilesForLabel(selectedNode.id).map(file => (
                <ThemedText key={file.id} style={styles.infoPanelItem}>
                  • {file.name}
                </ThemedText>
              ))}
            </>
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
    backgroundColor: '#000'
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
  labelText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  nodeText: {
    fontSize: 10,
    color: '#333333',
    marginTop: 2
  },
  tooltip: {
    position: 'absolute',
    top: -40,
    left: 0,
    padding: 6,
    backgroundColor: '#FFF',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 6,
    zIndex: 100
  },
  tooltipText: {
    fontSize: 12,
    color: '#333'
  },
  searchBarContainer: {
    marginTop: 12
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333'
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
  backButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#EAF0FF',
    zIndex: 10
  },
  backText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#3A6FF7',
    fontWeight: '600'
  }
});

export default GraphVisualization;
