// graphql.js - GraphQL query functions

// Generic GraphQL query function
async function graphqlQuery(query, variables = {}) {
    const token = getToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    console.log('Making GraphQL request...');

    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query, variables })
    });

    console.log('GraphQL response status:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('GraphQL error response:', errorText);
        throw new Error(`GraphQL request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        throw new Error(data.errors[0].message);
    }

    return data.data;
}

// Get user information
async function getUserInfo() {
    const query = `
        query {
            user {
                id
                login
                email
                attrs
            }
        }
    `;
    
    return await graphqlQuery(query);
}

// Get XP transactions
async function getXPTransactions(userId) {
    const query = `
        query($userId: Int!) {
            transaction(
                where: {
                    type: { _eq: "xp" }
                    userId: { _eq: $userId }
                }
                order_by: { createdAt: asc }
            ) {
                id
                amount
                createdAt
                path
                object {
                    name
                }
            }
        }
    `;
    
    return await graphqlQuery(query, { userId });
}

// Get audit data (up/down transactions)
async function getAuditData(userId) {
    const query = `
        query($userId: Int!) {
            transaction(
                where: {
                    userId: { _eq: $userId }
                    type: { _in: ["up", "down"] }
                }
                order_by: { createdAt: asc }
            ) {
                type
                amount
                createdAt
            }
        }
    `;
    
    return await graphqlQuery(query, { userId });
}

// Get project progress
async function getProjectsData(userId) {
    const query = `
        query($userId: Int!) {
            progress(
                where: {
                    userId: { _eq: $userId }
                    object: { type: { _eq: "project" } }
                }
                order_by: { updatedAt: desc }
            ) {
                id
                grade
                createdAt
                updatedAt
                path
                object {
                    name
                    type
                }
            }
        }
    `;
    
    return await graphqlQuery(query, { userId });
}

// Get all results (alternative to progress)
async function getResults(userId) {
    const query = `
        query($userId: Int!) {
            result(
                where: {
                    userId: { _eq: $userId }
                }
                order_by: { createdAt: desc }
            ) {
                id
                grade
                createdAt
                updatedAt
                path
                object {
                    name
                    type
                }
            }
        }
    `;
    
    return await graphqlQuery(query, { userId });
}
