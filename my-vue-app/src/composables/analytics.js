// analytics.js
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

// Export chart instances
export const eventChartInstance = ref(null);
export const userCCAChartInstance = ref(null);
export const userCategoryChartInstance = ref(null);

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
    const now = window.CURRENT_DATE; // Current date set to 1 Feb 2024

    // Filter events to only include past events (ending before the current date)
    const pastEvents = eventDocs
      .filter(doc => doc.exists())
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(event => {
        const eventEndDate = new Date(convertToISOFormat(event.end_date_time));
        return eventEndDate < now; // Only include past events
      });

    // Calculate total events and hours
    let totalHours = 0;
    const ccaCounts = {};
    const categoryCounts = {};

    pastEvents.forEach(event => {
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
      .sort(([, a], [, b]) => b - a)[0] || ['None', 0];
    const topCategory = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)[0] || ['None', 0];

    // Update user stats
    userStats.value = {
      totalEvents: pastEvents.length,
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
  try {
    if (!startDateTime || !endDateTime) {
      throw new Error('Invalid date string');
    }

    // Convert the date strings to a consistent format (ISO 8601)
    const parsedStartDateTime = convertToISOFormat(startDateTime);
    const parsedEndDateTime = convertToISOFormat(endDateTime);

    const start = new Date(parsedStartDateTime);
    const end = new Date(parsedEndDateTime);

    // Check if the date parsing resulted in valid dates
    if (isNaN(start) || isNaN(end)) {
      throw new Error('Invalid date parsing');
    }

    // Calculate the duration in hours
    return (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 0; // Return 0 hours if there is an error
  }
};

// Helper function to convert date strings to ISO format
const convertToISOFormat = (dateTimeStr) => {
  // Check if the format is already compatible
  if (dateTimeStr.includes('T')) {
    return dateTimeStr; // Already in ISO format
  }

  // Split the date and time parts
  const [datePart, timePart] = dateTimeStr.split(' ');
  if (!datePart || !timePart) {
    throw new Error('Invalid date-time format');
  }

  // Split the date part (assuming DD/MM/YYYY format)
  const [day, month, year] = datePart.split('/');
  if (!day || !month || !year) {
    throw new Error('Invalid date format');
  }

  // Return in ISO format (YYYY-MM-DDTHH:mm:ss)
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
};

// Update the general events bar chart
export const updateChart = (events) => {
  nextTick(() => {
    if (!eventChart.value) return;
    const chart = echarts.init(eventChart.value);

    // Assign the chart instance to the exported ref
    eventChartInstance.value = chart;

    const monthCounts = new Array(12).fill(0);

    events.forEach(event => {
      const parsedDate = parseEventDate(event.start_date_time);
      if (!isNaN(parsedDate)) {
        const month = parsedDate.getMonth();
        monthCounts[month]++;
      }
    });

    const options = {
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
        color: '#693EFE', 
      }]
    };

    chart.setOption(options);
  });
};

// Update the user's CCA distribution chart
export const updateUserCCAChart = (ccaCounts) => {
  if (!userCCAChart.value) return;

  const chart = echarts.init(userCCAChart.value);

  // Assign the chart instance to the exported ref
  userCCAChartInstance.value = chart;

  const data = Object.entries(ccaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const option = {
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
      color: ['#693EFE', '#7C4EFF', '#8c52ff', '#5230A3', '#2B0F62']

    }]
  };

  chart.setOption(option);
};

// Update the user's category distribution chart
export const updateUserCategoryChart = (categoryCounts) => {
  if (!userCategoryChart.value) return;

  const chart = echarts.init(userCategoryChart.value);

  // Assign the chart instance to the exported ref
  userCategoryChartInstance.value = chart;

  const data = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const option = {
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
      color:['#FE3E73', '#FF6B91', '#FF92AF', '#E3265A', '#B21E48']


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

export const toggleCCA = (index) => {
  const collapseElement = document.getElementById(`collapse-${index}`);
  if (collapseElement.classList.contains('show')) {
    collapseElement.classList.remove('show');
  } else {
    // Close any other open collapses before opening the current one (optional)
    document.querySelectorAll('.collapse').forEach((el) => {
      if (el !== collapseElement) {
        el.classList.remove('show');
      }
    });
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
