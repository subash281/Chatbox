import React, { useContext, useEffect } from "react";
import { List, ListItem, ListItemText, Badge, Avatar, Grid } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { addNotifications, resetNotifications } from "../features/userSlice";
import "./Sidebar.css";


function Sidebar() {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { socket, setMembers, members, setCurrentRoom, setRooms, privateMemberMsg, rooms, setPrivateMemberMsg, currentRoom } = useContext(AppContext);

    function joinRoom(room, isPublic = true) {
        if (!user) {
            return alert("Please login");
        }
        socket.emit("join-room", room, currentRoom);
        setCurrentRoom(room);

        if (isPublic) {
            setPrivateMemberMsg(null);
        }
        // dispatch for notifications
        dispatch(resetNotifications(room));
    }

    socket.off("notifications").on("notifications", (room) => {
        if (currentRoom !== room) dispatch(addNotifications(room));
    });

    useEffect(() => {
        if (user) {
            setCurrentRoom("general");
            getRooms();
            socket.emit("join-room", "general");
            socket.emit("new-user");
        }
    }, []);

    socket.off("new-user").on("new-user", (payload) => {
        setMembers(payload);
    });

    function getRooms() {
        fetch("http://localhost:5001/rooms")
            .then((res) => res.json())
            .then((data) => setRooms(data));
    }

    function orderIds(id1, id2) {
        if (id1 > id2) {
            return id1 + "-" + id2;
        } else {
            return id2 + "-" + id1;
        }
    }

    function handlePrivateMemberMsg(member) {
        setPrivateMemberMsg(member);
        const roomId = orderIds(user._id, member._id);
        joinRoom(roomId, false);
    }

    if (!user) {
        return <></>;
    }
    

    return (
        <>
           
           <h2>Groups</h2>
      <List>
        {rooms.map((room, idx) => (
          <ListItem
            key={idx}
            button
            onClick={() => joinRoom(room)}
            selected={room === currentRoom}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: room === currentRoom ? '#fff' : '#5F9EA0', // Change these colors
              border: '1px solid #ccc', // Add a border for a more professional look
              borderRadius: '5px', // Optional: add border-radius for rounded corners
            }}
          >
            <ListItemText
              primary={`${room} ${currentRoom !== room && `(${user.newMessages[room]})`}`}
              style={{
                color: room === currentRoom ? 'black' : 'black', // Change text color based on selection
                fontWeight: room === currentRoom ? 'bold' : 'normal', // Make selected item bold
              }}
            />
          </ListItem>
        ))}
      </List>


            <h2>Chats</h2>
            <List>
                {members.map((member) => (
                    <ListItem
                        key={member.id}
                        button
                        onClick={() => handlePrivateMemberMsg(member)}
                        disabled={member._id === user._id}
                        selected={privateMemberMsg?._id === member?._id}>
                        <Grid container alignItems="center">
                            <Grid item xs={2} className="member-status">
                                <Avatar alt={member.name} src={member.picture} className="member-status-img" />
                                {member.status === "online" ? <i className="fas fa-circle sidebar-online-status"></i> : <i className="fas fa-circle sidebar-offline-status"></i>}
                            </Grid>
                            <Grid item xs={8}>
                                {member.name}
                                {member._id === user?._id && " (You)"}
                                {member.status === "offline" && " (Offline)"}
                            </Grid>
                            <Grid item xs={1}>
                                <Badge badgeContent={user.newMessages[orderIds(member._id, user._id)]} color="primary"></Badge>
                            </Grid>
                        </Grid>
                    </ListItem>
                ))}
            </List>
        </>
    );
}
export default Sidebar;
