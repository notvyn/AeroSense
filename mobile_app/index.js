import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Captured by AeroSense ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.errorTitle}>AEROSENSE RUNTIME DIAGNOSTIC</Text>
            <Text style={styles.errorMessage}>{String(this.state.error?.message || this.state.error)}</Text>
            <Text style={styles.stackTrace}>
              {this.state.errorInfo?.componentStack || this.state.error?.stack || 'No stack trace available.'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <Text style={styles.retryText}>RETRY LAUNCH</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }
    return <App />;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#0B1120',
    padding: 24,
    justifyContent: 'center',
  },
  scroll: {
    paddingVertical: 40,
  },
  errorTitle: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  errorMessage: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 20,
  },
  stackTrace: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryText: {
    color: '#0B1120',
    fontWeight: '800',
    fontSize: 13,
  },
});

registerRootComponent(ErrorBoundary);
