# 5x5_uploader

Can be used to instantly create a dropfile area and file queue with very little setup.

Uses Materialize for responsive layout and alerts.

Demo page can be found [here](https://cesperian.github.io/5x5_uploader/example/index.html).
## Installation


```
$ npm install 5x5_uploader
```

## Basic Setup

```
<div id="uploader">
    <span id="config">
        {
            "destination": "/uploader.jsp"
        }
    </span>
</div>
```

## Options
Options that can be specified when initializing uploader;

|Name   |Type   |Default   |Description   |
|:---:|:---:|:---:|---|
|destination   |string   |null   |**Required**. Path to a processing script/api   |
| destinationParams  |object   |null   |Key/value pairs that can be used for creating a querystring on upload   |
|sizeLimit   |integer   |1   |Limit of individual file sizes, in MB    |
|fileLimit   |integer   |5   |Limit of total number files that can be queued for upload   |
|selectOpts   |object   |null   |Key/value pairs used to render a select element for each file queued for upload. Key is used for the individual option value and the key's value displayed to user. Chosen value gets appended to file object as property 'fileType'     |
|showDescription   |boolean   |false   |If true will render a text input for each file queued for upload. Value gets appended to file object as property 'description'   |

