// components/CustomCard.js
import {  ListItem } from "@mui/material";
import {
  IconButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import { TbCircleArrowUpFilled, TbCircleArrowDownFilled } from "react-icons/tb";
import { FaEquals } from "react-icons/fa";
import { styled } from '@mui/material/styles';


const StyledSecondaryText = styled('span')({ color: 'grey', 
fontStyle: 'italic', 
});

export default function ListCustomItem({
  title,
  content,
  image,
  change,
  index,
}) {
  let iconToShow = <FiberNewIcon />
  if (change > 0) {
    iconToShow = <><TbCircleArrowUpFilled className="arrowUp"/>{change}</>
  } else if (change < 0) {
    iconToShow = <><TbCircleArrowDownFilled className="arrowDown" />{Math.abs(change)}</>
  } else if (change === 0) {
    iconToShow = <FaEquals />
  }
  return (
    <ListItem className="list-item"
      secondaryAction={
        <IconButton edge="end" aria-label="delete" className="change-icon">
          {iconToShow} 
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar className="avatar-modified">{index + 1}</Avatar>
      </ListItemAvatar>
      <ListItemText className="list-item" primary={title} secondary={<StyledSecondaryText>{content}</StyledSecondaryText>} />
    </ListItem>
  );
}
