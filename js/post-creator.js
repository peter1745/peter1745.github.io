function StringReplaceAt(str, index, tokenSize, replacement)
{
    return str.substring(0, index) + replacement + str.substring(index + tokenSize);
}

function ReplaceTokens(content, token, newToken)
{
    let tokenPos = content.indexOf(token);

    while (tokenPos !== -1)
    {
        if (IsInsideCode(content, tokenPos))
        {
            tokenPos = content.indexOf(token, tokenPos + token.length);
            continue;
        }

        content = StringReplaceAt(content, tokenPos, token.length, newToken);

        tokenPos = content.indexOf(token, tokenPos + token.length);
    }

    return content;
}

function ReplaceLinks(content)
{
    let linkStart = content.indexOf('[');

    while (linkStart !== -1)
    {
        let closingBracket = content.indexOf('](', linkStart);

        if (closingBracket === -1)
            break;

        let linkEnd = content.indexOf(')', closingBracket);

        if (linkEnd === -1)
            break;

        // Valid link
        let linkLabel = content.substring(linkStart + 1, closingBracket);
        let linkURL = content.substring(closingBracket + 2, linkEnd);
        let tokenLength = 1 + linkLabel.length + 2 + linkURL.length + 1;

        content = StringReplaceAt(content, linkStart, tokenLength, `<a href="${linkURL}" target="_blank">${linkLabel}</a>`);

        linkStart = content.indexOf('[', linkEnd);
    }

    return content;
}

const imageExtensions = [ '.jpg', '.png', '.jpeg', '.gif' ];

function ReplaceImageLinks(content)
{
    let linkStart = content.indexOf('![');

    while (linkStart !== -1)
    {
        let closingBracket = content.indexOf('](', linkStart);

        if (closingBracket === -1)
            break;

        let linkEnd = content.indexOf(')', closingBracket);

        if (linkEnd === -1)
            break;

        // Valid link
        let imageAlt = content.substring(linkStart + 2, closingBracket);
        let imageURL = content.substring(closingBracket + 2, linkEnd);

        let validExtension = false;

        for (let extension of imageExtensions)
        {
            if (imageURL.includes(extension))
            {
                validExtension = true;
                break;
            }
        }

        if (!validExtension)
        {
            linkStart = content.indexOf('![', linkEnd);
            continue;
        }

        let tokenLength = 2 + imageAlt.length + 2 + imageURL.length + 1;

        content = StringReplaceAt(content, linkStart, tokenLength, `<img src="${imageURL}" alt="${imageAlt}" class="d-block img-fluid mx-auto" />`);

        linkStart = content.indexOf('![', linkEnd);
    }

    return content;
}

function IsInsideCode(content, tokenIndex)
{
    let codeBlockStart = content.indexOf('<code');

    while (codeBlockStart !== -1)
    {
        let codeBlockEnd = content.indexOf('</code>', codeBlockStart);

        if (tokenIndex > codeBlockStart && tokenIndex < codeBlockEnd)
            return true;

        codeBlockStart = content.indexOf('<code', codeBlockEnd);
    }

    return false;
}

function EscapeCodeBraces(content)
{
    let openPos = content.indexOf('<');

    while (openPos !== -1)
    {
        if (!IsInsideCode(content, openPos))
        {
            openPos = content.indexOf('<', openPos + 1);
            continue;
        }

        content = StringReplaceAt(content, openPos, 1, '&lt;');
        
        let closeBracket = content.indexOf('>', openPos);

        if (!IsInsideCode(content, closeBracket))
        {
            openPos = content.indexOf('<', openPos + 1);
            continue;
        }

        content = StringReplaceAt(content, closeBracket, 1, '&gt;');

        openPos = content.indexOf('<', closeBracket);
    }

    return content;
}

function ReplaceHeadings(content, headingToken, headingOpen, headingClose)
{
    let headingPos = content.indexOf(headingToken);

    while (headingPos !== -1)
    {
        if (IsInsideCode(content, headingPos))
        {
            headingPos = content.indexOf(headingToken, headingPos + 1);
            continue;
        }

        let lastNewLineSubstring = content.substring(0, headingPos);
        let endLine = content.indexOf('\n', headingPos);
        let str = content.substring(headingPos, lastNewLineSubstring.lastIndexOf('\n'));
        str = str.trim();

        if (str.length !== 0)
        {
            if (endLine === -1)
                headingPos = -1;
            else
                headingPos = content.indexOf(headingToken, endLine);

            continue;
        }

        content = StringReplaceAt(content, headingPos, headingToken.length, headingOpen);
        
        content = StringReplaceAt(content, endLine + 2, 1, headingClose);

        headingPos = content.indexOf(headingToken, headingPos);
    }

    return content;
}

function ReplaceBlockTokens(content, openToken, endToken, newOpenToken, newEndToken, replaceNewLine = false)
{
    let openTokenPos = content.indexOf(openToken);

    while (openTokenPos !== -1)
    {
        if (IsInsideCode(content, openTokenPos))
        {
            openTokenPos = content.indexOf(openToken, openTokenPos + 1);
            continue;
        }

        content = StringReplaceAt(content, openTokenPos, replaceNewLine ? openToken.length + 1 : openToken.length, newOpenToken);

        let endTokenPos = content.indexOf(endToken, openTokenPos);

        if (endTokenPos === -1)
            break;

        content = StringReplaceAt(content, endTokenPos, endToken.length, newEndToken);

        openTokenPos = content.indexOf(openToken, endTokenPos);
    }

    return content;
}

function BuildLists(content, listItemToken, listTag, listEndTag)
{
    const listItemTag = '<li>';
    const listItemEndTag = '</li>';

    let listStart = content.indexOf(listItemToken);

    while (listStart !== -1)
    {
        // Build unordered list HTML
        let listHTML = listTag;

        // Insert already known list item
        let listItemStart = listStart;
        let listItemEnd = content.indexOf('\n', listItemStart + 2);
        listItemEnd = listItemEnd === -1 ? content.length : listItemEnd;
        listHTML += `${listItemTag}${content.substring(listItemStart + 2, listItemEnd)}${listItemEndTag}`;

        // Find any additional list items and insert them into list
        listItemStart = content.indexOf(listItemToken, listItemEnd);
        while (listItemStart !== -1)
        {
            listItemEnd = content.indexOf('\n', listItemStart + 2);
            listItemEnd = listItemEnd === -1 ? content.length : listItemEnd;
            listHTML += `${listItemTag}${content.substring(listItemStart + 2, listItemEnd)}${listItemEndTag}`;
            let newLine = content.indexOf('\n', listItemEnd + 1);
            newLine = newLine === -1 ? content.length : newLine;
            listItemStart = content.indexOf(listItemToken, listItemEnd);

            if (newLine < listItemStart)
            {
                // There's a blank line between this and the next list element, so we end the list
                break;
            }
        }

        listHTML += listEndTag;
        
        let listLength = listItemEnd - listStart + 1;
        content = StringReplaceAt(content, listStart, listLength, listHTML);

        listStart = content.indexOf(listItemToken, listStart + listLength);
    }

    return content;
}

function PreProcessContent(content)
{
    content = ReplaceBlockTokens(content, '```', '```', '<pre><code>', '</code></pre>', true);
    content = EscapeCodeBraces(content);

    content = ReplaceImageLinks(content);
    content = ReplaceLinks(content);

    content = ReplaceBlockTokens(content, '**', '**', '<b>', '</b>');
    content = ReplaceBlockTokens(content, '*', '*', '<i>', '</i>');

    content = ReplaceHeadings(content, '####', '<h4>', '</h4>');
    content = ReplaceHeadings(content, '###', '<h3>', '</h3>');
    content = ReplaceHeadings(content, '##', '<h2>', '</h2>');
    content = ReplaceHeadings(content, '#', '<h1>', '</h1>');

    content = ReplaceTokens(content, '---', '<hr />');

    // TODO: Support nested lists

    content = BuildLists(content, '- ', '<ul>', '</ul>');
    content = BuildLists(content, '1. ', '<ol>', '</ol>');

    content = content.trim();

    content = ReplaceTokens(content, '\n', '<br/>');

    return content;
}