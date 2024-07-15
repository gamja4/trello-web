import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Board } from '../types';

const defaultList: Board[] = []; // Assuming defaultList is defined somewhere else

function BoardList() {
    const [boards, setBoards] = useState<Board[]>(defaultList);
    const { boardId } = useParams<{ boardId: string }>();

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const res = await callApi('get');
            console.log(res);
            setBoards(res.data);
            console.log(boards);
        } catch (error) {
            console.error('Error fetching boards:', error);
            // Handle error state or display error message
        }
    };

    const callApi = async (method: 'get' | 'post' | 'put' | 'delete', body?: any, func?: any) => {
        const url = `http://localhost:8080/api/boards`;
        const token = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0MkB0ZXN0LmNvbSIsImF1dGgiOiJVU0VSIiwiZXhwIjoxODAxNzIwODU3NDIwLCJpYXQiOjE3MjA4NTc0MjB9.OCSft86wVv6li6ig80_lLxtq0iUHRandxWmugnxWo4vGQ_ez8rqfy0LzSwL7Wh1b2r61Ks9gxY2vGUJsjQ-64Q";

        try {
            const res = await axios({
                url: url,
                method: method,
                headers: {
                    "Authorization": token
                },
                data: body,
            });

            if (func) func(res.data);
            return res.data;
        } catch (error) {
            throw new Error('API Request Error: ' + error.message);
        }
    };

    const handleClick = (e) => {
        console.log("add board 클릭");
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Board List</h1>
                <div className="flex gap-4">
                    <button className="py-2 px-4 rounded text-white font-bold hover:bg-gray-200 hover:text-gray-800" onClick={handleClick}>
                        Add Board
                    </button>
                    <Link
                        to="/login"
                        className="py-2 px-4 rounded text-white font-bold hover:bg-gray-200 hover:text-gray-800"
                    >
                        Login
                    </Link>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {boards.map(board => (
                    <div key={board.id} className="border border-gray-300 rounded p-4 mb-4">
                        <Link to={`/board/${board.id}`} className="block font-bold text-white">{board.title}</Link>
                    </div>
                ))}
            </div>
        </div>

    );
}

export default BoardList;