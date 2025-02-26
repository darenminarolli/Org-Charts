/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../pnpjsConfig";
import type { IChartsProps, IUser } from "./IChartsProps";
import { Tree, TreeNode } from "react-organizational-chart";
import { PanZoomContainer } from "./PanZoomContainer";
import "./Charts.css";

const buildHierarchy = (data: IUser[]): IUser[] => {
  const allNodes: Record<string, IUser> = {};
  const isChild = new Set<string>();

  data.forEach((user) => {
    const fullName = `${user.lastName || ""} ${user.lastName0 || ""}`.trim();
    user.fullName = fullName;
    user.children = [];
    user.isDummy = false;
    allNodes[fullName] = user;
  });

  data.forEach((user) => {
    if (user.reporting) {
      const supervisorName = user.reporting.trim();
      let supervisorNode = allNodes[supervisorName];
      if (!supervisorNode) {
        supervisorNode = {
          Id: supervisorName,
          fullName: supervisorName,
          children: [],
          isDummy: true,
        };
        allNodes[supervisorName] = supervisorNode;
      }
      supervisorNode.children.push(user);
      isChild.add(user.fullName);
    }
  });

  const roots: IUser[] = [];
  Object.keys(allNodes).forEach((key) => {
    if (!isChild.has(key)) {
      roots.push(allNodes[key]);
    }
  });

  return roots;
};

const OrgChartNode: React.FC<{ node: IUser; level?: number }> = ({ node, level = 1 }) => {
  const [expanded, setExpanded] = React.useState(false);
  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };
  return (
    <TreeNode
      label={
        <div className={`user-node ${node.isDummy ? "dummy" : ""}`}>
          <div className="user-node-header">
            <h3>
              {node.fullName} {node.isDummy && ""}
            </h3>
          </div>
          {!node.isDummy && (
            <div className="user-node-body">
              {node.Role_x002f_Seniority && (
                <p>
                  <strong>Role:</strong> {node.Role_x002f_Seniority}
                </p>
              )}
              {node.Account && (
                <p>
                  <strong>Account:</strong> {node.Account}
                </p>
              )}
              {node.Team && (
                <p>
                  <strong>Team:</strong> {node.Team}
                </p>
              )}
              {node.location && (
                <p>
                  <strong>Location:</strong> {node.location}
                </p>
              )}
              {node.Email && (
                <p>
                  <strong>Email:</strong> {node.Email}
                </p>
              )}
            </div>
          )}
          {node.children.length > 0 && level >= 2 && (
            <button className="expand-btn" onClick={toggleExpanded}>
              {expanded ? "-" : "+"}
            </button>
          )}
        </div>
      }
    >
      {node.children.map((child) =>
        level < 2 || expanded ? (
          <OrgChartNode key={child.Id} node={child} level={level + 1} />
        ) : null
      )}
    </TreeNode>
  );
};

const Charts: React.FC<IChartsProps> = (props) => {
  // Guard: check if the context is provided
  if (!props.context) {
    console.error("SP context is undefined. Please ensure your web part is provided with a valid SharePoint context.");
    return <div>Error: SP context not available</div>;
  }

  const LIST_NAME = "Employees";
  const _sp: SPFI = getSP(props.context)!;
  const [treeData, setTreeData] = React.useState<IUser[]>([]);
  console.log('props.site', props.site)
  const getUsers = async (project: string) => {
    try {
      const filterQuery = `Account eq '${project}' or Team eq '${project}'`;
      const data: IUser[] = await _sp.web.lists
        .getByTitle(LIST_NAME)
        .items.filter(filterQuery)();
      console.log("data", data);
      const hierarchy = buildHierarchy(data);
      setTreeData(hierarchy);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  React.useEffect(() => {
    const currentSiteUrl = props.context.pageContext.web.absoluteUrl;
    const siteName = currentSiteUrl.split("/sites/")[1] || "";
    console.log("Current Site Name:", siteName);
    if (props.site) {
      getUsers(props.site);
      return;
    }
    getUsers("Advantage");
  }, []);

  console.log("treeData", treeData);
  return (
    <div className="org-chart-container">
      <h1>Organizational Chart</h1>
      <PanZoomContainer>
        <div className="org-chart-wrapper">
          {treeData.map((root) => (
            <Tree
              key={root.Id}
              lineWidth={"2px"}
              lineColor={"#0078D4"}
              lineBorderRadius={"10px"}
              label={
                <div className={`user-node ${root.isDummy ? "dummy" : ""}`}>
                  <div className="user-node-header">
                    <h3>
                      {root.fullName}{" "}
                      {root.isDummy
                        ? ""
                        : root.reporting
                        ? " (Top Supervisor)"
                        : ""}
                    </h3>
                  </div>
                  {!root.isDummy && (
                    <div className="user-node-body">
                      {root.Role_x002f_Seniority && (
                        <p>
                          <strong>Role:</strong> {root.Role_x002f_Seniority}
                        </p>
                      )}
                      {root.Account && (
                        <p>
                          <strong>Account:</strong> {root.Account}
                        </p>
                      )}
                      {root.Team && (
                        <p>
                          <strong>Team:</strong> {root.Team}
                        </p>
                      )}
                      {root.location && (
                        <p>
                          <strong>Location:</strong> {root.location}
                        </p>
                      )}
                      {root.Email && (
                        <p>
                          <strong>Email:</strong> {root.Email}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              }
            >
              {root.children.map((child) => (
                <OrgChartNode key={child.Id} node={child} />
              ))}
            </Tree>
          ))}
        </div>
      </PanZoomContainer>
    </div>
  );
};

export default Charts;
