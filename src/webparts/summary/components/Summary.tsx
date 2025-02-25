/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from "react";
import type { ICount, ISummaryProps } from "./ISummaryProps";
import { SPFI } from "@pnp/sp";
import { useEffect, useState } from "react";
import { getSP } from "../../../pnpjsConfig";
import { IUser } from "../../charts/components/IChartsProps";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  ChartOptions,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  ChartDataLabels
);

const black = "#000000";
const yellow = "#FFD700";
const gray = "#969AA1";
const white = "#FFFFFF";

const Summary: React.FC<ISummaryProps> = (props) => {
  const LIST_NAME = "Employees";
  const _sp: SPFI = getSP(props.context)!;

  const [employees, setEmployees] = useState<IUser[]>([]);
  const [roleCounts, setRoleCounts] = useState<ICount[]>([]);
  const [locationCounts, setLocationCounts] = useState<ICount[]>([]);

  const getEmployees = async (project: string) => {
    try {
      const filterQuery = `Team eq '${project}' or Account eq '${project}'`;
      const data: IUser[] = await _sp.web.lists
        .getByTitle(LIST_NAME)
        .items.filter(filterQuery)();

      setEmployees(data);
    } catch (error) {
      console.log("Error while fetching employees", error);
    }
  };

  const countUniqueValues = (columnName: keyof IUser): ICount[] => {
    const counts: Record<string, number> = {};

    employees.forEach((employee) => {
      const value = employee[columnName];
      if (typeof value === "string" || typeof value === "number") {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    const sortedCounts: ICount[] = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        title: key,
        count: value,
      }));

    return sortedCounts;
  };

  useEffect(() => {
    const currentSiteUrl = props.context.pageContext.web.absoluteUrl;
    const siteName = currentSiteUrl.split("/sites/")[1] || "";
    if (siteName === "Test01" || !siteName) {
      getEmployees("Advantage");
      return;
    }
    getEmployees(siteName);
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      setRoleCounts(countUniqueValues("Role_x002f_Seniority"));
      setLocationCounts(countUniqueValues("location"));
    }
  }, [employees]);

  // Roles grid
  const ITEMS_PER_ROW = 4;

  const totalCount = roleCounts.reduce((sum, item) => sum + item.count, 0);
  const totalItems = roleCounts.length;
  const lastRowItems = totalItems % ITEMS_PER_ROW;
  const emptySlots = lastRowItems === 0 ? 3 : 3 - lastRowItems;

  const styles: Record<string, React.CSSProperties> = {
    background: {
      backgroundColor: yellow,
      marginBottom: "40px",
      padding: "16px",
    },
    title: {
      fontWeight: "bold",
      fontSize: "32px",
      textAlign: "center",
      marginBottom: "16px",
    },
    gridContainer: {
      display: "grid",
      gridTemplateColumns: `repeat(${ITEMS_PER_ROW}, 1fr)`,
      gap: "16px",
      background: "transparent",
    },
    gridItem: {
      padding: "16px",
      backgroundColor: "transparent",
      textAlign: "center",
    },
    itemCount: {
      fontWeight: "bold",
      fontSize: "32px",
    },
    itemTitle: {
      fontSize: "14px",
    },
    specialItem: {
      padding: "16px",
      backgroundColor: black,
      textAlign: "center",
    },
    specialItemCount: {
      color: white,
      fontWeight: "bold",
      fontSize: "32px",
    },
    specialItemTitle: {
      color: white,
      fontWeight: "bold",
      fontSize: "14px",
    },
  };

  // Location doughnut chart
  const total = locationCounts.reduce((sum, item) => sum + item.count, 0);

  const chartData = {
    labels: locationCounts.map((item) => item.title),
    datasets: [
      {
        data: locationCounts.map((item) => item.count),
        backgroundColor: [black, yellow, gray],
      },
    ],
  };

  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
        formatter: (value: number, ctx: any) => {
          const percentage = ((value / total) * 100).toFixed(0);
          const location = ctx.chart.data.labels?.[ctx.dataIndex];
          const count = value;
          const employeesText = count === 1 ? "employee" : "employees";

          return `${location}: ${percentage}%\n(${count} ${employeesText})`;
        },
        color: (context:any) => {
          const index = context.dataIndex;
          const colors = [black, yellow, gray];
          return colors[index % colors.length];
        },
        font: {
          weight: "bold",
          size: 14,
        },
        padding: 16,
        backgroundColor: white,
        textAlign: "center",
      },
    },
  };

  return (
    <div>
      <div style={styles.background}>
        <div style={styles.title}>Headcounts by Role:</div>

        <div style={styles.gridContainer}>
          {roleCounts.map((item, index) => (
            <div key={index} style={styles.gridItem}>
              <div style={styles.itemCount}>{item.count}</div>
              <div style={styles.itemTitle}>{item.title}</div>
            </div>
          ))}

          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={`empty-${i}`} style={{ visibility: "hidden" }}></div>
          ))}

          <div style={styles.specialItem}>
            <div style={styles.specialItemCount}>{totalCount}</div>
            <div style={styles.specialItemTitle}>TOTAL</div>
          </div>
        </div>
      </div>

      <div>
        <div style={styles.title}>Headcounts by Location:</div>
        <Doughnut data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Summary;
