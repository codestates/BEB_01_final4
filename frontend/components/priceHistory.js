import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PriceHistory = ({ labels, priceArr }) => {
  console.log(priceArr);
  console.log(priceArr.length);

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Price History",
      },
      legend: {
        labels: {
          // This more specific font property overrides the global property
          font: {
            family: "VT323, Noto Sans KR, sans-serif",
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: priceArr,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return <Line options={options} data={data} />;
};

export default PriceHistory;
