let tooltipTriggerList = [];
let tooltipList = [];

function ReadTextFile(path, callback)
{
    let request = new XMLHttpRequest();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200)
            callback(request.responseText);
    };

    request.open('GET', path, true);
    request.send(null);
}

function GetFilesInFolder(path, callback)
{
    let request = new XMLHttpRequest();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200)
            callback(request.responseText);
    };

    request.open('GET', path, true);
    request.send(null);
}

function InvalidateTooltips()
{
    tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipList = [...tooltipTriggerList].map(tooltipTriggerElement => new bootstrap.Tooltip(tooltipTriggerElement));
}

window.addEventListener('load', () =>
{
    ReadTextFile('../includes/navbar.html', (text) =>
    {
        document.body.insertAdjacentHTML('afterbegin', text);
        InvalidateTooltips();
    });

    ReadTextFile('../includes/footer.html', (text) =>
    {
        document.body.insertAdjacentHTML('beforeend', text);
    });

    // let scrollPos = 0;
    // const mainNav = document.getElementById('mainNav');
    // const headerHeight = mainNav.clientHeight;
    // window.addEventListener('scroll', () =>
    // {
    //     const currentTop = document.body.getBoundingClientRect().top * -1;

    //     if ( currentTop < scrollPos)
    //     {
    //         // Scrolling Up
    //     }
    //     else
    //     {
    //         // Scrolling Down
    //     }

    //     scrollPos = currentTop;
    // });
});
