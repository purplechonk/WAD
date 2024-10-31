import * as echarts from 'echarts';
import { ref, nextTick } from 'vue';
import { fetchAllEvents } from './fetchEvents';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// Reactive state for general analytics
export const categories = ref([]);
export const selectedCategory = ref('');
export const allEvents = ref([]);
export const filteredEvents = ref([]);
export const topCCAs = ref([]);
export const eventChart = ref(null);

// Reactive state for user analytics
export const userStats = ref({
  totalEvents: 0,
  totalHours: 0,
  topCCA: { name: '', count: 0 },
  topCategory: { name: '', count: 0 }
});
export const userCCAChart = ref(null);
export const userCategoryChart = ref(null);

// Initialize general analytics
export const initializeAnalytics = async () => {
  allEvents.value = await fetchAllEvents();
  categories.value = getUniqueCategories(allEvents.value);
  filterEventsByCategory();
};

// Initialize user analytics
export const initializeUserAnalytics = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, 'user_records', user.uid));
    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const signedUpEvents = userData.signed_up_events || [];

    // Fetch full details of all signed-up events
    const eventPromises = signedUpEvents.map(eventId => 
      getDoc(doc(db, 'events', eventId))
    );
    const eventDocs = await Promise.all(eventPromises);
    const events = eventDocs
      .filter(doc => doc.exists())
      .map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate total events and hours
    let totalHours = 0;
    const ccaCounts = {};
    const categoryCounts = {};

    events.forEach(event => {
      // Calculate hours
      totalHours += calculateDuration(event.start_date_time, event.end_date_time);

      // Count CCAs
      if (event.cca) {
        ccaCounts[event.cca] = (ccaCounts[event.cca] || 0) + 1;
      }

      // Count categories
      if (event.category) {
        event.category.forEach(cat => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      }
    });

    // Find top CCA and category
    const topCCA = Object.entries(ccaCounts)
      .sort(([,a], [,b]) => b - a)[0] || ['None', 0];
    const topCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0] || ['None', 0];

    // Update user stats
    userStats.value = {
      totalEvents: events.length,
      totalHours: Math.round(totalHours * 10) / 10,
      topCCA: { name: topCCA[0], count: topCCA[1] },
      topCategory: { name: topCategory[0], count: topCategory[1] }
    };

    // Update visualizations
    updateUserCCAChart(ccaCounts);
    updateUserCategoryChart(categoryCounts);
  } catch (error) {
    console.error('Error initializing user analytics:', error);
  }
};

// Filter events based on selected category
export const filterEventsByCategory = () => {
  if (selectedCategory.value) {
    filteredEvents.value = allEvents.value.filter(event =>
      event.category?.includes(selectedCategory.value)
    );
  } else {
    filteredEvents.value = [...allEvents.value];
  }
  updateChart(filteredEvents.value);
  updateLeaderboard(filteredEvents.value);
};

// Get unique categories from events
const getUniqueCategories = (events) => {
  const categoriesSet = new Set();
  events.forEach(event => {
    if (event.category) {
      event.category.forEach(cat => categoriesSet.add(cat));
    }
  });
  return Array.from(categoriesSet);
};

// Calculate duration in hours between two datetime strings
const calculateDuration = (startDateTime, endDateTime) => {
  const start = new Date(startDateTime.split(' ').join('T'));
  const end = new Date(endDateTime.split(' ').join('T'));
  return (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
};

// Update the general events bar chart
export const updateChart = (events) => {
  nextTick(() => {
    const chart = echarts.init(eventChart.value);

    const monthCounts = new Array(12).fill(0);

    events.forEach(event => {
      const parsedDate = parseEventDate(event.start_date_time);
      if (!isNaN(parsedDate)) {
        const month = parsedDate.getMonth();
        monthCounts[month]++;
      }
    });

    const options = {
      title: { 
        text: 'Number of Events per Month',
        textStyle: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial'
        }
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: [{
        data: monthCounts,
        type: 'bar',
        smooth: true,
        color: '#0d6efd', // Bootstrap primary color
      }]
    };

    chart.setOption(options);
  });
};

// Update the user's CCA distribution chart
export const updateUserCCAChart = (ccaCounts) => {
  if (!userCCAChart.value) return;

  const chart = echarts.init(userCCAChart.value);
  
  const data = Object.entries(ccaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const option = {
    title: {
      text: 'Your Top CCAs',
      left: 'center',
      textStyle: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} events'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c}'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: data,
      // Bootstrap-inspired colors
      color: ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545']
    }]
  };

  chart.setOption(option);
};

// Update the user's category distribution chart
export const updateUserCategoryChart = (categoryCounts) => {
  if (!userCategoryChart.value) return;

  const chart = echarts.init(userCategoryChart.value);
  
  const data = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const option = {
    title: {
      text: 'Your Top Categories',
      left: 'center',
      textStyle: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} events'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c}'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: data,
      // Bootstrap-inspired colors
      color: ['#198754', '#20c997', '#0dcaf0', '#0d6efd', '#6610f2']
    }]
  };

  chart.setOption(option);
};

// Update the leaderboard with top 5 CCAs
export const updateLeaderboard = (events) => {
  const ccaCounts = {};

  events.forEach(event => {
    const cca = event.cca;
    if (cca) {
      ccaCounts[cca] = (ccaCounts[cca] || 0) + 1;
    }
  });

  const sortedCCAs = Object.entries(ccaCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  topCCAs.value = sortedCCAs.slice(0, 5);
};

// Toggle the collapse for a CCA in the leaderboard
export const toggleCCA = (index) => {
  const collapseElement = document.getElementById(`collapse-${index}`);
  const isCollapsed = collapseElement.classList.contains('show');
  if (isCollapsed) {
    collapseElement.classList.remove('show');
  } else {
    collapseElement.classList.add('show');
  }
};

// Get events organized by a specific CCA (filtered by category)
export const getEventsByCCA = (ccaName) => {
  return filteredEvents.value.filter((event) => event.cca === ccaName);
};

// Helper function to safely parse event dates
const parseEventDate = (dateString) => {
  try {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return NaN;
  }
};