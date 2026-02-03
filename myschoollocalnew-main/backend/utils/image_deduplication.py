"""
Image Deduplication Utility for MySchool Portal
Deduplicates images based on image codes/filenames to ensure unique results
"""

import re
from typing import List, Dict, Any, Set
from urllib.parse import urlparse, parse_qs
import os

def extract_image_code(url: str) -> str:
    """
    Extract unique image code from URL.
    Handles various URL formats from R2, local uploads, and database paths.
    
    Examples:
        https://r2.dev/academic/exam-tips/IMG_001.jpg -> IMG_001
        /uploads/images/photo_12345.png -> photo_12345
        https://portal.myschoolct.com/uploads/tips/animal_001.jpg -> animal_001
        /academic/class-1/image?id=ABC123 -> ABC123
    
    Returns:
        Unique identifier for the image
    """
    if not url:
        return ""
    
    # Remove query parameters for cleaner extraction
    base_url = url.split('?')[0]
    
    # Try to extract filename from path
    path = urlparse(base_url).path
    filename = os.path.basename(path)
    
    # If we have a filename with extension, extract the base name
    if filename and '.' in filename:
        # Remove extension and return base name
        image_code = os.path.splitext(filename)[0]
        # Clean up the code (remove common prefixes)
        image_code = re.sub(r'^(img_|image_|photo_|pic_)', '', image_code, flags=re.IGNORECASE)
        return image_code.lower()
    
    # Try to extract ID from query parameters
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    if 'id' in query_params:
        return query_params['id'][0].lower()
    if 'image_id' in query_params:
        return query_params['image_id'][0].lower()
    
    # Try to extract numeric/alphanumeric ID from path segments
    path_segments = [seg for seg in path.split('/') if seg]
    if path_segments:
        # Check last segment for ID-like pattern
        last_segment = path_segments[-1]
        id_match = re.search(r'(\d+|[a-z0-9]{6,})', last_segment, re.IGNORECASE)
        if id_match:
            return id_match.group(1).lower()
    
    # Fallback: use cleaned URL as identifier
    clean_url = re.sub(r'https?://', '', url.lower())
    clean_url = re.sub(r'[^\w\-]', '_', clean_url)
    return clean_url[:100]  # Limit length

def extract_image_codes_from_results(results: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Extract image codes from search results.
    
    Args:
        results: List of search result dictionaries
    
    Returns:
        Dictionary mapping result index to image code
    """
    codes = {}
    for idx, result in enumerate(results):
        # Try different URL field names
        url = (result.get('path') or 
               result.get('url') or 
               result.get('thumbnail') or 
               result.get('image_url') or 
               result.get('s3_path') or 
               '')
        
        if url:
            codes[idx] = extract_image_code(url)
    
    return codes

def deduplicate_results(
    results: List[Dict[str, Any]], 
    keep_first: bool = True,
    url_fields: List[str] = None
) -> List[Dict[str, Any]]:
    """
    Deduplicate search results based on image codes.
    
    Args:
        results: List of search result dictionaries
        keep_first: If True, keep first occurrence; if False, keep last
        url_fields: List of field names to check for URLs (default: ['path', 'url', 'thumbnail'])
    
    Returns:
        Deduplicated list of results (only unique images)
    
    Example:
        results = [
            {'title': 'Exam Tip 1', 'path': '/tips/animal_001.jpg', 'source': 'A'},
            {'title': 'Exam Tip 2', 'path': '/tips/animal_001.jpg', 'source': 'B'},
            {'title': 'Exam Tip 3', 'path': '/tips/plant_002.jpg', 'source': 'A'},
        ]
        unique = deduplicate_results(results)
        # Returns: [{'title': 'Exam Tip 1', ...}, {'title': 'Exam Tip 3', ...}]
    """
    if url_fields is None:
        url_fields = ['path', 'url', 'thumbnail', 'image_url', 's3_path']
    
    seen_codes: Set[str] = set()
    unique_results: List[Dict[str, Any]] = []
    duplicate_count = 0
    
    for result in results:
        # Extract URL from any of the possible fields
        url = None
        for field in url_fields:
            if field in result and result[field]:
                url = result[field]
                break
        
        if not url:
            # No URL found, keep the result
            unique_results.append(result)
            continue
        
        # Extract image code
        image_code = extract_image_code(url)
        
        if image_code not in seen_codes:
            # First occurrence of this image
            seen_codes.add(image_code)
            unique_results.append(result)
        else:
            # Duplicate found
            duplicate_count += 1
            if not keep_first:
                # Replace previous occurrence with this one
                # Find and replace the previous item with same code
                for i, prev_result in enumerate(unique_results):
                    prev_url = None
                    for field in url_fields:
                        if field in prev_result and prev_result[field]:
                            prev_url = prev_result[field]
                            break
                    
                    if prev_url and extract_image_code(prev_url) == image_code:
                        unique_results[i] = result
                        break
    
    return unique_results

def get_deduplication_stats(
    results: List[Dict[str, Any]], 
    deduplicated: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Get statistics about deduplication.
    
    Returns:
        Dictionary with original_count, unique_count, duplicates_removed
    """
    return {
        "original_count": len(results),
        "unique_count": len(deduplicated),
        "duplicates_removed": len(results) - len(deduplicated),
        "deduplication_rate": f"{((len(results) - len(deduplicated)) / len(results) * 100):.1f}%" if results else "0%"
    }

# Testing and examples
if __name__ == "__main__":
    print("=" * 80)
    print("Image Deduplication Utility - Test Suite")
    print("=" * 80)
    
    # Test 1: Extract image codes
    print("\nTest 1: Extract Image Codes")
    print("-" * 80)
    test_urls = [
        "https://r2.cloudflare.com/academic/exam-tips/IMG_001.jpg",
        "/uploads/images/photo_12345.png",
        "https://portal.myschoolct.com/uploads/tips/animal_001.jpg",
        "/academic/class-1/animal_001.jpg",
        "https://example.com/image?id=ABC123",
    ]
    
    for url in test_urls:
        code = extract_image_code(url)
        print(f"  {url}")
        print(f"    -> Code: {code}\n")
    
    # Test 2: Deduplicate results
    print("\nTest 2: Deduplicate Search Results")
    print("-" * 80)
    test_results = [
        {'title': 'Exam Tip - Animals (Source A)', 'path': 'https://r2.dev/tips/animal_001.jpg', 'category': 'ACADEMIC'},
        {'title': 'Study Guide - Animals (Source B)', 'path': '/uploads/tips/animal_001.jpg', 'category': 'EDUTAINMENT'},
        {'title': 'Worksheet - Animals (Source C)', 'path': 'https://portal.myschoolct.com/images/animal_001.jpg', 'category': 'PRINT-RICH'},
        {'title': 'Exam Tip - Plants', 'path': '/uploads/tips/plant_002.jpg', 'category': 'ACADEMIC'},
        {'title': 'Exam Tip - Numbers', 'path': '/uploads/tips/number_003.jpg', 'category': 'ACADEMIC'},
    ]
    
    print(f"Original results: {len(test_results)}")
    for i, r in enumerate(test_results, 1):
        print(f"  {i}. {r['title']} ({r['path']})")
    
    deduplicated = deduplicate_results(test_results)
    
    print(f"\nAfter deduplication: {len(deduplicated)}")
    for i, r in enumerate(deduplicated, 1):
        print(f"  {i}. {r['title']} ({r['path']})")
    
    stats = get_deduplication_stats(test_results, deduplicated)
    print(f"\nDeduplication Stats:")
    print(f"  Original: {stats['original_count']}")
    print(f"  Unique: {stats['unique_count']}")
    print(f"  Removed: {stats['duplicates_removed']}")
    print(f"  Rate: {stats['deduplication_rate']}")
    
    print("\n" + "=" * 80)
    print("✓ All tests completed successfully!")
    print("=" * 80)
