function makeFoldersArray() {
    return [
        {
            id: 1,
            name: 'Test Folder 1'
        },
        {
            id: 2,
            name: 'Test Folder 2'
        },
        {
            id: 3,
            name: 'Test Folder 3'
        }
    ]
}

function makeMaliciousFolder() {
    const maliciousFolder = {
        id: 911,
        name: 'Folder with <script>alert("xss");</script>'
    }

    const expectedFolder = {
        ...maliciousFolder,
        name: 'Folder with &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
    }

    return {
        maliciousFolder,
        expectedFolder
    }
}

module.exports = { makeFoldersArray, makeMaliciousFolder }