from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
import logging
import os
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from bson import ObjectId

# Configure logging
logger = logging.getLogger(__name__)

# MongoDB connection setup
mongo_uri = 'mongodb://' + os.environ["MONGO_HOST"] + ':' + os.environ["MONGO_PORT"]
db = MongoClient(mongo_uri)['test_db']
COLLECTION_NAME = 'todos'


class TodoListView(APIView):
    """
    API view for handling TODO list operations.
    Supports GET (retrieve all todos) and POST (create new todo).
    """

    def _format_todo(self, todo):
        """
        Helper method to format todo document for JSON response.
        Converts ObjectId to string and datetime to ISO format.
        """
        if not todo:
            return None
        
        # Create a copy to avoid modifying the original
        formatted = dict(todo)
        
        # Convert ObjectId to string
        if '_id' in formatted:
            formatted['_id'] = str(formatted['_id'])
        
        # Convert datetime to ISO format string
        if 'created_at' in formatted and isinstance(formatted['created_at'], datetime):
            formatted['created_at'] = formatted['created_at'].isoformat()
        
        return formatted

    def get(self, request):
        """
        Retrieve all TODO items from MongoDB.
        
        Returns:
            Response: JSON response containing list of todos or error message
        """
        try:
            # Get todos collection
            todos_collection = db[COLLECTION_NAME]
            
            # Fetch all todos from MongoDB, sorted by creation date (newest first)
            todos_cursor = todos_collection.find().sort('created_at', -1)
            
            # Convert MongoDB documents to list and format for JSON response
            todos = []
            for todo in todos_cursor:
                # Convert ObjectId to string for JSON serialization
                todo['_id'] = str(todo['_id'])
                # Convert datetime to ISO format string for JSON serialization
                if 'created_at' in todo and isinstance(todo['created_at'], datetime):
                    todo['created_at'] = todo['created_at'].isoformat()
                todos.append(todo)
            
            logger.info(f"Successfully retrieved {len(todos)} todos")
            
            return Response(
                {
                    'success': True,
                    'data': todos,
                    'count': len(todos)
                },
                status=status.HTTP_200_OK
            )
            
        except ConnectionFailure as e:
            logger.error(f"MongoDB connection error: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Database connection failed. Please try again later.'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            logger.error(f"Unexpected error retrieving todos: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'An unexpected error occurred while retrieving todos.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    def post(self, request):
        """
        Create a new TODO item in MongoDB.
        
        Expected request body:
            {
                "description": "string" (required)
            }
        
        Returns:
            Response: JSON response containing created todo or error message
        """
        try:
            # Extract description from request data
            description = request.data.get('description', '').strip()
            
            # Validate input
            if not description:
                return Response(
                    {
                        'success': False,
                        'error': 'Description is required and cannot be empty.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check description length (reasonable limit)
            MAX_DESCRIPTION_LENGTH = 500
            if len(description) > MAX_DESCRIPTION_LENGTH:
                return Response(
                    {
                        'success': False,
                        'error': f'Description cannot exceed {MAX_DESCRIPTION_LENGTH} characters.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get todos collection
            todos_collection = db[COLLECTION_NAME]
            
            # Create todo document
            todo_doc = {
                'description': description,
                'created_at': datetime.utcnow(),
                'completed': False
            }
            
            # Insert into MongoDB
            result = todos_collection.insert_one(todo_doc)
            
            # Retrieve the created document
            created_todo = todos_collection.find_one({'_id': result.inserted_id})
            
            # Format the created todo
            formatted_todo = self._format_todo(created_todo)
            
            logger.info(f"Successfully created todo with id: {result.inserted_id}")
            
            return Response(
                {
                    'success': True,
                    'data': formatted_todo,
                    'message': 'Todo created successfully'
                },
                status=status.HTTP_201_CREATED
            )
            
        except ConnectionFailure as e:
            logger.error(f"MongoDB connection error: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Database connection failed. Please try again later.'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except OperationFailure as e:
            logger.error(f"MongoDB operation error: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Database operation failed. Please try again.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Unexpected error creating todo: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'An unexpected error occurred while creating the todo.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TodoDetailView(APIView):
    """
    API view for handling individual TODO operations.
    Supports PUT (update todo) and DELETE (delete todo).
    """

    def _format_todo(self, todo):
        """
        Helper method to format todo document for JSON response.
        """
        if not todo:
            return None
        
        formatted = dict(todo)
        if '_id' in formatted:
            formatted['_id'] = str(formatted['_id'])
        if 'created_at' in formatted and isinstance(formatted['created_at'], datetime):
            formatted['created_at'] = formatted['created_at'].isoformat()
        return formatted

    def put(self, request, todo_id):
        """
        Update an existing TODO item in MongoDB.
        
        Expected request body:
            {
                "description": "string" (required)
            }
        
        Returns:
            Response: JSON response containing updated todo or error message
        """
        try:
            # Validate todo_id
            try:
                object_id = ObjectId(todo_id)
            except Exception:
                return Response(
                    {
                        'success': False,
                        'error': 'Invalid todo ID format.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Extract and validate description
            description = request.data.get('description', '').strip()
            
            if not description:
                return Response(
                    {
                        'success': False,
                        'error': 'Description is required and cannot be empty.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            MAX_DESCRIPTION_LENGTH = 500
            if len(description) > MAX_DESCRIPTION_LENGTH:
                return Response(
                    {
                        'success': False,
                        'error': f'Description cannot exceed {MAX_DESCRIPTION_LENGTH} characters.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get todos collection
            todos_collection = db[COLLECTION_NAME]
            
            # Check if todo exists
            existing_todo = todos_collection.find_one({'_id': object_id})
            if not existing_todo:
                return Response(
                    {
                        'success': False,
                        'error': 'Todo not found.'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Update the todo
            update_result = todos_collection.update_one(
                {'_id': object_id},
                {'$set': {'description': description}}
            )
            
            # Retrieve updated todo
            updated_todo = todos_collection.find_one({'_id': object_id})
            formatted_todo = self._format_todo(updated_todo)
            
            logger.info(f"Successfully updated todo with id: {todo_id}")
            
            return Response(
                {
                    'success': True,
                    'data': formatted_todo,
                    'message': 'Todo updated successfully'
                },
                status=status.HTTP_200_OK
            )
            
        except ConnectionFailure as e:
            logger.error(f"MongoDB connection error: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Database connection failed. Please try again later.'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except OperationFailure as e:
            logger.error(f"MongoDB operation error: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Database operation failed. Please try again.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Unexpected error updating todo: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'An unexpected error occurred while updating the todo.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, todo_id):
        """
        Delete a TODO item from MongoDB.
        
        Returns:
            Response: JSON response confirming deletion or error message
        """
        try:
            # Validate todo_id
            try:
                object_id = ObjectId(todo_id)
            except Exception:
                return Response(
                    {
                        'success': False,
                        'error': 'Invalid todo ID format.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get todos collection
            todos_collection = db[COLLECTION_NAME]
            
            # Check if todo exists
            existing_todo = todos_collection.find_one({'_id': object_id})
            if not existing_todo:
                return Response(
                    {
                        'success': False,
                        'error': 'Todo not found.'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Delete the todo
            delete_result = todos_collection.delete_one({'_id': object_id})
            
            if delete_result.deleted_count == 0:
                return Response(
                    {
                        'success': False,
                        'error': 'Failed to delete todo.'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            logger.info(f"Successfully deleted todo with id: {todo_id}")
            
            return Response(
                {
                    'success': True,
                    'message': 'Todo deleted successfully'
                },
                status=status.HTTP_200_OK
            )
            
        except ConnectionFailure as e:
            logger.error(f"MongoDB connection error: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Database connection failed. Please try again later.'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except OperationFailure as e:
            logger.error(f"MongoDB operation error: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Database operation failed. Please try again.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Unexpected error deleting todo: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'An unexpected error occurred while deleting the todo.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

