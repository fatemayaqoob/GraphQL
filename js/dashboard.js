// authentication with back-button protection
function checkAuthAndRedirect() {
    const token = localStorage.getItem('jwt');
    
    if (!token || !isAuthenticated()) {
        // Clear any stale data
        localStorage.removeItem('jwt');
        window.location.replace('index.html');
        return false;
    }
    return true;
}

// initial auth check
if (!checkAuthAndRedirect()) {
    // Stop execution if not authenticated
    throw new Error('Not authenticated');
}

// check back-button navigation
window.addEventListener('pageshow', function(event) {
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        console.log('Page loaded from cache, re-checking authentication...');
        checkAuthAndRedirect();
    }
});

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        checkAuthAndRedirect();
    }
});

// DOM elements
const logoutBtn = document.getElementById('logoutBtn');
const loadingEl = document.getElementById('loading');
const profileContent = document.getElementById('profile-content');

// user info
const welcomeUsernameEl = document.getElementById('welcome-username');
const userEmailEl = document.getElementById('user-email');
const userXpEl = document.getElementById('user-xp');
const auditRatioEl = document.getElementById('audit-ratio');

// projects stats more
const completedProjectsEl = document.getElementById('completed-projects');
const failedProjectsEl = document.getElementById('failed-projects');
const inProgressProjectsEl = document.getElementById('in-progress-projects');
const successRateEl = document.getElementById('success-rate');
const recentProjectsEl = document.getElementById('recent-projects');

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

async function loadProfile(){
    try {
        showLoading();

        console.log('Starting profile load...');
        console.log('Token:', localStorage.getItem('jwt')?.substring(0, 20) + '...');

        const userData = await getUserInfo();
        console.log('User data received:', userData);
        const user = userData.user[0];

        displayUserInfo(user);
        
        // xp transactions
        const xpData = await getXPTransactions(user.id);
        const totalXP = calculateTotalXP(xpData.transaction);
        displayXP(totalXP);

        // audit data
        const auditData = await getAuditData(user.id);
        const auditRatio = calculateAuditRatio(auditData.transaction);
        displayAuditRatio(auditRatio);

        // projects
        const projectsData = await getProjectsData(user.id);
        const projects = projectsData.progress;

        // results (latest outcomes per project attempts)
        const resultsData = await getResults(user.id);
        const projectResults = (resultsData.result || []).filter(r => r.object?.type === 'project');

        displayProjectStats(projects, projectResults);
        displayRecentProjects(projects.slice(0, 10));

        // make charts
        generateAuditBarChart(auditData.transaction);
        generateXPLineChart(xpData.transaction);
        generateSuccessPieChart(projects, projectResults);

        hideLoading();
    } catch (error) {
        console.error('error loading profile:',error);
        showError(error.message);
    }
}

function displayUserInfo(user){
    if (welcomeUsernameEl) welcomeUsernameEl.textContent = user.login || 'User';
    
    // Also update nav username if it exists
    const navUsernameEl = document.getElementById('welcome-username-nav');
    if (navUsernameEl) navUsernameEl.textContent = `Welcome, ${user.login || 'User'}`;
    
    if (userEmailEl) userEmailEl.textContent = user.email || 'N/A';
}

function calculateTotalXP(transactions) {
    return transactions.reduce((sum,t) => sum+t.amount, 0);
}

function displayXP(totalXP) {
    if (userXpEl) userXpEl.textContent = formatXP(totalXP);

}

function calculateAuditRatio(audits) {
    const auditUp = audits
        .filter(t => t.type === 'up')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const auditDown = audits
        .filter(t => t.type === 'down')
        .reduce((sum, t) => sum + t.amount, 0);
    
    return auditDown > 0 ? (auditUp / auditDown).toFixed(1) : 'N/A';
}

function displayAuditRatio(ratio) {
    if (auditRatioEl) auditRatioEl.textContent = ratio;
}

function displayProjectStats(projects, projectResults = []) {
    console.log('=== PROJECT STATS DEBUG ===');
    console.log('Total entries from API:', projects.length);
    console.log('All projects:', projects.map(p => ({ objectId: p.object?.id, grade: p.grade, name: p.object?.name })));

    // Group attempts by project object ID to inspect repeated attempts (retakes).
    const groupedByObjectId = projects.reduce((acc, project) => {
        const key = project.object?.id ?? project.object?.name ?? project.id;
        if (!acc[key]) acc[key] = [];
        acc[key].push(project);
        return acc;
    }, {});

    const repeatedProjectGroups = Object.entries(groupedByObjectId)
        .filter(([, attempts]) => attempts.length > 1)
        .map(([key, attempts]) => ({
            key,
            attempts: attempts.length,
            name: attempts[0]?.object?.name,
            grades: attempts.map(a => a.grade),
            latestGrade: attempts[0]?.grade,
            hasFailAttempt: attempts.some(a => a.grade != null && a.grade <= 0),
            hasPassAttempt: attempts.some(a => a.grade > 0)
        }));

    console.log('Repeated project IDs count:', repeatedProjectGroups.length);
    if (repeatedProjectGroups.length > 0) {
        console.table(repeatedProjectGroups);
    }
    
    //ensure no duplicates
    const uniqueProjects = [];
    const seen = new Set();
    const getProjectKey = (project) => project.object?.id ?? project.object?.name ?? project.id;
    
    projects.forEach(project => {
        const key = getProjectKey(project);
        if (!seen.has(key)) {
            seen.add(key);
            uniqueProjects.push(project);
        }
    });
    
    console.log('After deduplication: %d unique projects', uniqueProjects.length);
    console.log('Unique projects:', uniqueProjects.map(p => ({ objectId: p.object?.id, grade: p.grade, name: p.object?.name })));
    
    // History-aware stats:
    // - Failed: project has ANY failed attempt (grade <= 0)
    // - Passed: project has ANY passed attempt (grade > 0)
    // Repeated IDs can contribute to both pass and fail if they have both outcomes.
    // - In progress: latest attempt has null and no graded attempts yet
    const projectHistories = Object.values(groupedByObjectId).map(attempts => {
        const latest = attempts[0];
        const hasFailAttempt = attempts.some(a => a.grade != null && a.grade <= 0);
        const hasPassAttempt = attempts.some(a => a.grade > 0);
        return { latest, hasFailAttempt, hasPassAttempt };
    });

    const failed = projectHistories.filter(h => h.hasFailAttempt).length;
    const passed = projectHistories.filter(h => h.hasPassAttempt).length;
    const inProgress = projectHistories.filter(h => h.latest?.grade == null && !h.hasPassAttempt && !h.hasFailAttempt).length;
    
    const total = passed + failed;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    console.log('Outcome source:', 'history-aware progress attempts');
    console.log('Passed (any passed attempt):', passed);
    console.log('Failed (any failed attempt):', failed);
    console.log('In Progress (grade === null):', inProgress);
    console.log('Total graded:', total);
    console.log('Success rate:', successRate + '%');
    console.log('=========================');

    if (completedProjectsEl) completedProjectsEl.textContent = passed;
    if (failedProjectsEl) failedProjectsEl.textContent = failed;
    if (inProgressProjectsEl) inProgressProjectsEl.textContent = inProgress;
    if (successRateEl) successRateEl.textContent = successRate + '%';
}

function displayRecentProjects(projects) {
    if (!recentProjectsEl) return;

    if(projects.length === 0) {
        recentProjectsEl.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No projects found.</p>';
        return;
    }

    recentProjectsEl.innerHTML = projects.map(project => {
        let statusClass, statusText;
        if (project.grade > 0) {
            statusClass = 'passed';
            statusText = 'Passed';
        } else if (project.grade != null && project.grade <= 0) {
            statusClass = 'failed';
            statusText = 'Failed';
        } else {
            statusClass = 'in-progress';
            statusText = 'In Progress';
        }
        
        return `
            <div class="project-item">
                <div class="project-info">
                    <div class="project-name">${project.object.name}</div>
                    <div class="project-path">Object ID: ${project.object?.id ?? 'N/A'}</div>
                </div>
                <span class="project-status ${statusClass}">
                    ${statusText}
                </span>
            </div>
        `;
    }).join('');
}

function showLoading() {
    if (loadingEl) loadingEl.style.display = 'block';
    if (profileContent) profileContent.style.display = 'none';
}

function hideLoading() {
    if (loadingEl) loadingEl.style.display = 'none';
    if (profileContent) profileContent.style.display = 'block';
}

function showError(message) {
    if (loadingEl) {
        loadingEl.innerHTML = `
            <div class="error">
                <h3>Error Loading Profile</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn-primary">Retry</button>
                <button onclick="logout()" class="btn-secondary">Logout</button>
            </div>
        `;
    }
}

// start dashboard
loadProfile();