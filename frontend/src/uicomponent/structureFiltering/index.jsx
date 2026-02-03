import React, { useState, useEffect, useCallback } from 'react';
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import { LeftArrow, RightArrow } from '../../uicomponent/filter/Arrow';
import useDrag from '../../customTheme/signUpMenu/useDrag';
import "../../customTheme/signUpMenu/hideScrollBar.css";
import "./filter.css";
import { filterConfig, academicImageBankCategories } from './constant/filterData';
import { useLocation } from "react-router-dom";

const StructureFilter = ({ loadImages }) => {
    const location = useLocation();
    const [filters, setFilters] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [subFilters, setSubFilters] = useState([]);
    const [selectedSubFilter, setSelectedSubFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { dragStart, dragStop, dragMove, dragging } = useDrag();
    const handleDrag = ({ scrollContainer }) => (e) => dragMove(e, (posDiff) => {
        if (scrollContainer.current) {
            scrollContainer.current.scrollLeft += posDiff;
        }
    });
    
    // Check if this is Academic Image Bank
    const isAcademicImageBank = location.pathname.toLowerCase().includes('/academic/imagebank');
    
    // Get the current category from URL (e.g., /views/academic/imagebank/animals -> ANIMALS)
    const getCurrentCategory = useCallback(() => {
        const pathname = location.pathname.toLowerCase();
        const parts = pathname.split('/').filter(p => p);
        
        // For /views/academic/imagebank/animals, get "animals"
        const imagebankIndex = parts.indexOf('imagebank');
        if (imagebankIndex !== -1 && parts[imagebankIndex + 1]) {
            return parts[imagebankIndex + 1].toUpperCase();
        }
        return null;
    }, [location.pathname]);
    
    // Initialize Level 1 filters on mount
    useEffect(() => {
        if (isAcademicImageBank) {
            // Set Level 1 filters from static config
            const level1Filters = academicImageBankCategories.map(f => f.title);
            setFilters(level1Filters);
            
            // Check if URL has a category - if so, fetch sub-filters for it
            const currentCategory = getCurrentCategory();
            if (currentCategory && level1Filters.includes(currentCategory)) {
                setSelectedFilter(currentCategory);
                fetchSubFilters(currentCategory);
            }
        }
        // Reset selections when URL changes
        setSelectedSubFilter(null);
    }, [location.pathname, isAcademicImageBank, getCurrentCategory]);
    
    // Fetch sub-filters (Level 2) from API
    const fetchSubFilters = async (category) => {
        setLoading(true);
        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/rest/images/fetch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    folderPath: `ACADEMIC/IMAGE BANK/${category}`,
                    imagesPerPage: 1 
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const apiFilters = data.filters || [];
                setSubFilters(apiFilters);
            }
        } catch (error) {
            console.error('Error fetching sub-filters:', error);
            setSubFilters([]);
        }
        setLoading(false);
    };
    
    // Handle Level 1 filter click (e.g., ANIMALS, BIRDS)
    const handleFilterClick = (filter) => {
        if (dragging) return;
        
        // If clicking same filter, deselect and go back to showing all Level 1
        if (selectedFilter === filter) {
            setSelectedFilter(null);
            setSubFilters([]);
            setSelectedSubFilter(null);
            // Load all images for Image Bank
            loadImages('ACADEMIC/IMAGE BANK');
            return;
        }
        
        // Select this filter
        setSelectedFilter(filter);
        setSelectedSubFilter(null);
        
        // Fetch sub-filters
        fetchSubFilters(filter);
        
        // Load images for this category
        loadImages(`ACADEMIC/IMAGE BANK/${filter}`);
    };
    
    // Handle Level 2 filter click (e.g., DOMESTIC ANIMALS, WILD ANIMALS)
    const handleSubFilterClick = (subFilter) => {
        if (dragging) return;
        
        // If clicking same sub-filter, deselect
        if (selectedSubFilter === subFilter) {
            setSelectedSubFilter(null);
            // Load images for parent category
            loadImages(`ACADEMIC/IMAGE BANK/${selectedFilter}`);
            return;
        }
        
        // Select this sub-filter
        setSelectedSubFilter(subFilter);
        
        // Load images for this sub-category
        loadImages(`ACADEMIC/IMAGE BANK/${selectedFilter}/${subFilter}`);
    };
    
    // Handle "ALL" click - go back to Level 1
    const handleAllClick = () => {
        if (dragging) return;
        
        setSelectedFilter(null);
        setSubFilters([]);
        setSelectedSubFilter(null);
        
        // Load all images
        loadImages('ACADEMIC/IMAGE BANK');
    };
    
    // Don't render if not Academic Image Bank
    if (!isAcademicImageBank) {
        return null;
    }
    
    // Determine what to show in the filter bar
    const showLevel2 = selectedFilter && subFilters.length > 0;
    
    return (
        <div className="structureFilterContainer">
            <div className="structureFilterSelector">
                <ScrollMenu
                    onMouseDown={() => dragStart}
                    LeftArrow={LeftArrow}
                    RightArrow={RightArrow}
                    onMouseUp={() => dragStop}
                    onMouseMove={handleDrag}
                    style={{ width: '0px !important' }}
                >
                    {/* Show Level 2 filters when a category is selected */}
                    {showLevel2 ? (
                        <>
                            {/* ALL button to go back */}
                            <FilterCard
                                itemId="ALL"
                                title="ALL"
                                key="all-filter"
                                onClick={handleAllClick}
                                selected={false}
                                isAllButton={true}
                            />
                            {/* Sub-filters */}
                            {subFilters.map((subFilter, i) => (
                                <FilterCard
                                    itemId={subFilter}
                                    title={subFilter}
                                    key={`${subFilter}-${i}`}
                                    onClick={() => handleSubFilterClick(subFilter)}
                                    selected={selectedSubFilter === subFilter}
                                />
                            ))}
                        </>
                    ) : (
                        /* Show Level 1 filters */
                        filters.map((filter, i) => (
                            <FilterCard
                                itemId={filter}
                                title={filter}
                                key={`${filter}-${i}`}
                                onClick={() => handleFilterClick(filter)}
                                selected={selectedFilter === filter}
                            />
                        ))
                    )}
                </ScrollMenu>
            </div>
            {loading && <div style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>Loading...</div>}
        </div>
    );
};

function FilterCard({ onClick, selected, title, isAllButton }) {
    const visibility = React.useContext(VisibilityContext);
    return (
        <div onClick={() => onClick(visibility)} style={{ width: 'max-content' }} tabIndex={0}>
            <p className={selected ? "structureFilterItemActive" : (isAllButton ? "structureFilterItemAll" : "structureFilterItem")} unselectable="on">
                {title}
            </p>
        </div>
    );
}

export default StructureFilter;
