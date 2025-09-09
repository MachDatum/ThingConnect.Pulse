---
sidebar_position: 3
---

# Viewing History

Analyze historical monitoring data and trends to understand network performance over time.

## Historical Data Overview

ThingConnect Pulse stores comprehensive historical data with multiple aggregation levels:

- **Raw Data**: Individual monitoring checks (retained 60 days)
- **15-Minute Rollups**: Aggregated 15-minute summaries (retained 1 year)
- **Daily Rollups**: Daily performance summaries (retained indefinitely)

## Accessing Historical Data

### History Page

Navigate to **History** in the sidebar to access historical monitoring data:

1. **Select Time Range**: Choose from preset ranges or custom dates
2. **Filter Endpoints**: Select specific endpoints or groups
3. **Choose Data Level**: Raw data, 15-minute, or daily aggregation
4. **Generate Report**: View charts and data tables

### Time Range Selection

- **Last Hour**: Recent detailed monitoring activity
- **Last 24 Hours**: Daily performance overview
- **Last Week**: Weekly trends and patterns
- **Last Month**: Monthly reliability analysis
- **Custom Range**: Specify exact start and end dates

## Data Visualization

### Charts and Graphs

#### Availability Timeline
- **Status Timeline**: Visual representation of online/offline periods
- **Uptime Percentage**: Availability metrics over time
- **Outage Duration**: Length and frequency of downtime events

#### Performance Metrics
- **Response Time Charts**: Latency trends over time
- **Performance Distribution**: Response time histograms
- **Threshold Analysis**: Performance against defined thresholds

### Data Tables

#### Raw Event Data
- **Individual Checks**: Detailed results of each monitoring attempt
- **Status Changes**: Timeline of status transitions
- **Alert Events**: Historical alert triggers and resolutions

#### Aggregated Summaries
- **Hourly Summaries**: Aggregated performance by hour
- **Daily Statistics**: Daily uptime and performance metrics
- **Monthly Reports**: Long-term reliability trends

## Reporting Features

### Built-in Reports

#### Availability Reports
- **Uptime Summary**: Overall availability statistics
- **SLA Compliance**: Service level agreement tracking
- **Outage Analysis**: Detailed downtime investigation

#### Performance Reports
- **Response Time Analysis**: Latency trend analysis
- **Performance Benchmarks**: Comparison against baselines
- **Capacity Planning**: Growth and scaling insights

### Custom Reports

- **Report Builder**: Create custom reports with specific metrics
- **Scheduled Reports**: Automated report generation and delivery
- **Export Options**: PDF, CSV, and JSON export formats

## Data Export

### Export Formats

#### CSV Export
- **Raw Data Export**: Detailed monitoring check results
- **Summary Export**: Aggregated statistics and metrics
- **Custom Columns**: Select specific data fields

#### API Access
- **REST API**: Programmatic access to historical data
- **Bulk Export**: Large dataset retrieval
- **Real-time Streaming**: Live data feeds for integration

### Integration Options

- **Grafana**: Import data into Grafana dashboards
- **Splunk**: Forward data to Splunk for analysis
- **PowerBI**: Create business intelligence reports
- **Custom Tools**: Use API for custom integrations

## Analysis Tools

### Trend Analysis
- **Seasonal Patterns**: Identify recurring performance patterns
- **Correlation Analysis**: Find relationships between endpoints
- **Anomaly Detection**: Identify unusual performance deviations

### Comparative Analysis
- **Endpoint Comparison**: Compare performance across endpoints
- **Time Period Comparison**: Before/after analysis
- **Baseline Comparison**: Performance against established baselines

## Best Practices

### Data Retention
- **Archive Strategy**: Plan for long-term data archival
- **Storage Management**: Monitor database growth and performance
- **Cleanup Policies**: Configure appropriate data retention periods

### Performance Optimization
- **Query Optimization**: Efficient historical data queries
- **Index Management**: Maintain database performance
- **Aggregation Strategy**: Balance detail with performance

### Reporting Guidelines
- **Regular Reviews**: Schedule periodic performance reviews
- **Stakeholder Reports**: Create reports for different audiences
- **Action Items**: Convert insights into actionable improvements