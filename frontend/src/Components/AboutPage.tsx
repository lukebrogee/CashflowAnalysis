/*
------------------------------------------------------------------
FILE NAME:     AboutPage.tsx
PROJECT:       MoneyLens
Date Created:  Jun-09-2026
--------------------------------------------------------------------
DESCRIPTION:
Component for displaying information about the application.
--------------------------------------------------------------------
$HISTORY:

Jun-09-2026   Created initial file.
------------------------------------------------------------------
*/

import {useState} from "react";
import { bold } from "chalk";
import styles from "./AboutPage.module.scss";
import transactionImage from "../images/misc/aboutTransactionsPicture.png";
import azureLogo from "../images/misc/AzureLogo.png";
import reactLogo from "../images/misc/ReactLogo.png";
import golangLogo from "../images/misc/GolangLogo.png";
import plaidLogo from "../images/misc/PlaidLogo.png";
import githubLogo from "../images/misc/GitHubLogo.png";
import vsCodeLogo from "../images/misc/VSCodeLogo.png";
import buisnessPlanCover from "../images/misc/BusinessPlanCover.png";
import { IoDocumentText } from "react-icons/io5";
import { MdDashboardCustomize } from "react-icons/md";
import { FaCodeMerge, FaRegClock } from "react-icons/fa6";

interface GithubCommits {
    Date: string;
    Title: string;
    Commit: string;
}

function AboutPage() {

    const [commits, setCommits] = useState<GithubCommits[]>([]);

    const test = () => {
        const getcommits = async () => {
            const response = await fetch(
                "https://api.github.com/repos/lukebrogee/CashflowAnalysis/commits"
            );

            const commits = await response.json();
            setCommits(commits.map((commit: any) => {
                return {
                    Date: commit.commit.author.date,
                    Title: commit.commit.message.split("\n")[0],
                    Commit: commit.sha
                }
            }));
            
        }
        getcommits();
    };

    test();

    return (
        <div className={styles.aboutContainer}>
            <div className={styles.headerContainer}>
                <div className={styles.headerTextContainer}>
                    <h3>About MoneyLens</h3>
                    <h1><span style={{ color: '#000000' }}>See More.</span><br />Grow More.</h1>
                    <p>MoneyLens is a modern financial analytics platform that empowers users to make informed financial decisions, 
                        optimize their spending habits, and achieve their financial goals.
                    </p>
                </div>
                <div className={styles.headerImageContainer}>
                    <img src={transactionImage} alt="About MoneyLens" style={{ width: '600px', height: 'auto' }} />
                </div>
            </div>
            <div className={styles.contentContainer}>
                <div>
                    <h2>About This Project</h2>
                    <p>MoneyLens is a personal finance management tool designed to help users track their spending and analyze their financial habits. The app
                        provides users with custom dashboards and visuals to set up <strong>their</strong> environment to <strong>their</strong> needs.
                    </p>
                    <ul>
                        <li>Real time account updates with Plaid</li>
                        <li>Secure user authentication encryptions</li>
                        <li>Customizable dashboards to track the metrics that matter most to you</li>
                        <li>Clean and intuitive user interface with React</li>
                        <li>Scalable Golang backend with Microsoft Azure</li>
                    </ul>
                </div>
                <div>
                    <h2>Project Stack</h2>
                    <div className={styles.techStackContainer}>
                        <div className={styles.techItem}>
                            <img src={reactLogo} alt="React Logo" style={{ width: '36px', height: '36px' }} />
                            React
                        </div>
                        <div className={styles.techItem}>
                            <img src={golangLogo} alt="Golang Logo" style={{ width: '36px', height: '36px' }} />
                            Golang
                        </div>
                        <div className={styles.techItem}>
                            <img src={azureLogo} alt="Azure Logo" style={{ width: '36px', height: '36px' }} />
                            Microsoft Azure
                        </div>
                        <div className={styles.techItem}>
                            <img src={plaidLogo} alt="Plaid Logo" style={{ width: '36px', height: '36px' }} />
                            Plaid API
                        </div>
                        <div className={styles.techItem}>
                            <img src={githubLogo} alt="Github Logo" style={{ width: '36px', height: '36px' }} />
                            Github
                        </div>
                        <div className={styles.techItem}>
                            <img src={vsCodeLogo} alt="VS Code Logo" style={{ width: '36px', height: '36px' }} />
                            VS Code
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.businessPlanContainer}>
                <div className={styles.businessPlanTextContainer}>
                    <div className={styles.businessPlanLinkContainer}>
                        <h2>Business Plan</h2>
                        <p>View the full business plan that outlines the strategy, goals, objectives, and updates for the project.</p>
                        <div onClick={() => window.open('https://1drv.ms/w/c/993559f43856915f/IQDP-texiIyERriajPXJDLNGAWdmIwsJiJW-g0RlZ6GcQcM?e=ee41kQ', '_blank')} className={styles.businessPlanLink}>
                            <IoDocumentText className={styles.businessPlanIcon} size={24} />
                            View Business Plan
                        </div>
                    </div>
                    <div className={styles.businessPlanImage}>
                        <img src={buisnessPlanCover} alt="Business Plan Cover" style={{ width: '300px', height: 'auto' }} />
                    </div>                    
                </div>
                <div className={styles.developmentUpdatesContainer}>
                    <h2>Development Updates</h2>
                    <div className={styles.developmentUpdateTableContainer}>
                        <table className={styles.developmentUpdateTable}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Commit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commits.map((commit) => (
                                    <tr key={commit.Commit}>
                                        <td>{new Date(commit.Date).toLocaleDateString()}</td>
                                        <td>{commit.Title}</td>
                                        <td>{commit.Commit.slice(0, 7)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className={styles.footerContainer}>
                <h2>What Makes MoneyLens Different</h2>
                <div className={styles.differentiatorsContainer}>
                    <div className={styles.differentiatorContainer}>
                        <div className={styles.differentiatorIcon}>
                            <MdDashboardCustomize size={70} />
                        </div>
                        <div className={styles.differentiatorText}>
                            <h3>Fully Customizable</h3>
                            <p>Built to meet the unique needs of each user, allowing fully customizable dashboards and reports</p>
                        </div>
                    </div>
                    <div className={styles.differentiatorContainer}>
                        <div className={styles.differentiatorIcon}>
                            <FaCodeMerge size={70} />
                        </div>
                        <div className={styles.differentiatorText}>
                            <h3>Combine Financial Data</h3>
                            <p>Integrate and analyze financial information from all bank accounts, credit cards, investment accounts, and loans</p>
                        </div>
                    </div>
                    <div className={styles.differentiatorContainer}>
                        <div className={styles.differentiatorIcon}>
                            <FaRegClock size={70} />
                        </div>
                        <div className={styles.differentiatorText}>
                            <h3>Real Time Updates</h3>
                            <p>Stay informed with the latest financial information and updates in real-time</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutPage;