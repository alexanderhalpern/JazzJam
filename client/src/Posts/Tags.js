import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Input, Tag, Tooltip, Button, TextArea, Row } from "antd";
import "./Posts.css";

function TagElem(props) {
  const { state } = props;
  const { setState } = props;
  const { tags, inputVisible, inputValue, editInputIndex, editInputValue } =
    state;

  var editInput;
  var input;
  var newImage;

  const handleClose = (removedTag) => {
    const tags = state.tags.filter((tag) => tag !== removedTag);

    var newTags = { ...state };
    newTags.tags = tags;
    setState(newTags);
  };

  const showInput = () => {
    var newState = { ...state };
    newState.inputVisible = true;
    setState(newState, () => input.focus());
  };

  const handleInputChange = (e) => {
    var newState = { ...state };
    newState.inputValue = e.target.value;
    setState(newState);
  };

  const handleInputConfirm = () => {
    const { inputValue } = state;
    let { tags } = state;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }

    var newState = { ...state };
    newState.tags = tags;
    newState.inputVisible = false;
    newState.inputValue = "";
    setState(newState);
  };

  const handleEditInputChange = (e) => {
    var newState = { ...state };
    newState.editInputValue = e.target.value;
    setState(newState);
  };

  const handleEditInputConfirm = () => {
    var newTags = { ...state };
    newTags.tags[editInputIndex] = editInputValue;
    newTags.editInputIndex = -1;
    newTags.editInputValue = "";
    setState(newTags);
  };

  const saveInputRef = (input) => {
    input = input;
  };

  const saveEditInputRef = (input) => {
    editInput = input;
  };

  return (
    <div className="tagElem">
      {tags.map((tag, index) => {
        if (editInputIndex === index) {
          return (
            <Input
              ref={saveEditInputRef}
              key={tag}
              size="small"
              placeholder="Edit tag"
              style={{ width: "20%" }}
              className="tag-input"
              value={editInputValue}
              onChange={handleEditInputChange}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          );
        }

        const isLongTag = tag.length > 20;

        const tagElem = (
          <Tag
            className="edit-tag"
            key={tag}
            closable={true}
            onClose={() => handleClose(tag)}
          >
            <span
              onDoubleClick={(e) => {
                if (index !== 0) {
                  var newState = { ...state };
                  newState.editInputIndex = index;
                  newState.editInputValue = tag;
                  setState(newState, () => {
                    editInput.focus();
                  });
                  e.preventDefault();
                }
              }}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </span>
          </Tag>
        );
        return isLongTag ? (
          <Tooltip title={tag} key={tag}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        );
      })}
      {inputVisible && (
        <Input
          ref={saveInputRef}
          type="text"
          size="small"
          className="tag-input"
          placeholder="Add tag"
          style={{ width: "20%" }}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      )}
      {!inputVisible && (
        <Tag className="site-tag-plus" onClick={showInput}>
          <PlusOutlined /> New Tag
        </Tag>
      )}
    </div>
  );
}

export default TagElem;
