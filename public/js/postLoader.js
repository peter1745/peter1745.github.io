let postsDatabase = {};

function OnLoadError(error)
{
    let previewSpinner = document.getElementById('preview-spinner');
    previewSpinner.children[0].remove();
    let errorElement = document.createElement(`h3`);
    errorElement.innerText = error;
    previewSpinner.appendChild(errorElement);
}

function LoadPostsDatabase()
{
    return fetch('/posts/db.json').then((response) =>
    {
        if (response.ok === false)
        {
            OnLoadError(`Failed to load most recent posts. Server responded with: ${response.statusText}, code: ${response.status}`);
            return null;
        }

        postsDatabase = response.json();
        return postsDatabase;
    });
}

function LoadPostData(postIDs)
{
    return new Promise((successCallback, errorCallback) =>
    {
        let result = [];
        
        for (let postID of postIDs)
        {
            let request = new XMLHttpRequest();
            request.onload = () =>
            {
                try
                {
                    let jsonData = JSON.parse(request.responseText);
                    jsonData.ID = postID;
                    result.push(jsonData);
                }
                catch (err)
                {
                    errorCallback(err);
                }
            };
    
            request.open('GET', `/posts/${postID}.json`, false);
            request.send(null);
        }

        successCallback(result);
    });
}
