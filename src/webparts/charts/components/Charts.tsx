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


const OrgChartNode: React.FC<{ node: IUser }> = ({ node }) => {
  const [expanded, setExpanded] = React.useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  }
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
            </div>
          )}
            {node.children.length > 0 && (
              <button className="expand-btn" onClick={toggleExpanded}>{expanded ? "-" : "+"}</button>
            )}
        </div>
      }
    >
      {expanded && node.children.map((child) => (
        <OrgChartNode key={child.Id} node={child} />
      ))}
    </TreeNode>
  );
};


const Charts: React.FC<IChartsProps> = (props) => {
  const LIST_NAME = "Employees";
  const _sp: SPFI = getSP(props.context)!;
  const [treeData, setTreeData] = React.useState<IUser[]>([]);


  const getUsers = async (project: string) => {
    try {
      const filterQuery = `Team eq '${project || ""}' or Account eq '${project}'`;
      const data: IUser[] = await _sp.web.lists
        .getByTitle(LIST_NAME)
        .items.filter(filterQuery)();
        console.log("Data",data);
      const hierarchy = buildHierarchy(data);
      setTreeData(hierarchy);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  React.useEffect(() => {
    getUsers("Siemens");
  }, []);

  return (
    <div className="org-chart-container">
      <h1>Organizational Charts</h1>
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
