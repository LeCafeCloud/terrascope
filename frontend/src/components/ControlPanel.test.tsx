import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ControlPanel from './ControlPanel';
import { Graph } from '../types/api';

describe('ControlPanel', () => {
    const mockGraph: Graph = {
        nodes: [
            {
                id: 'aws_s3_bucket.example',
                type: 'aws_s3_bucket',
                mode: 'managed',
                provider: 'aws',
                module: 'module.storage',
            },
            {
                id: 'azurerm_resource_group.example',
                type: 'azurerm_resource_group',
                mode: 'managed',
                provider: 'azurerm',
            },
            {
                id: 'data.aws_ami.ubuntu',
                type: 'aws_ami',
                mode: 'data',
                provider: 'aws',
            },
        ],
        edges: [
            { source: 'aws_s3_bucket.example', target: 'azurerm_resource_group.example', type: 'depends_on' },
        ],
    };

    const defaultFilters = {
        provider: '',
        module: '',
        mode: '',
    };

    it('should render filters section', () => {
        const onFiltersChange = vi.fn();
        render(
            <ControlPanel
                graph={mockGraph}
                filters={defaultFilters}
                onFiltersChange={onFiltersChange}
            />
        );

        expect(screen.getByText('Filters')).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /provider/i })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /module/i })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /mode/i })).toBeInTheDocument();
    });

    it('should display statistics', () => {
        const onFiltersChange = vi.fn();
        render(
            <ControlPanel
                graph={mockGraph}
                filters={defaultFilters}
                onFiltersChange={onFiltersChange}
            />
        );

        expect(screen.getByText('3')).toBeInTheDocument(); // Total Resources
        expect(screen.getByText('1')).toBeInTheDocument(); // Dependencies
        expect(screen.getByText('2')).toBeInTheDocument(); // Providers (aws, azurerm)
    });

    it('should populate provider dropdown with unique providers', () => {
        const onFiltersChange = vi.fn();
        render(
            <ControlPanel
                graph={mockGraph}
                filters={defaultFilters}
                onFiltersChange={onFiltersChange}
            />
        );

        const providerSelect = screen.getByRole('combobox', { name: /provider/i }) as HTMLSelectElement;
        expect(providerSelect.options.length).toBe(3); // "All Providers" + aws + azurerm
        expect(providerSelect.options[1].value).toBe('aws');
        expect(providerSelect.options[2].value).toBe('azurerm');
    });

    it('should call onFiltersChange when provider is selected', () => {
        const onFiltersChange = vi.fn();
        render(
            <ControlPanel
                graph={mockGraph}
                filters={defaultFilters}
                onFiltersChange={onFiltersChange}
            />
        );

        const providerSelect = screen.getByRole('combobox', { name: /provider/i });
        fireEvent.change(providerSelect, { target: { value: 'aws' } });

        expect(onFiltersChange).toHaveBeenCalledWith({
            provider: 'aws',
            module: '',
            mode: '',
        });
    });

    it('should call onFiltersChange when mode is selected', () => {
        const onFiltersChange = vi.fn();
        render(
            <ControlPanel
                graph={mockGraph}
                filters={defaultFilters}
                onFiltersChange={onFiltersChange}
            />
        );

        const modeSelect = screen.getByRole('combobox', { name: /mode/i });
        fireEvent.change(modeSelect, { target: { value: 'data' } });

        expect(onFiltersChange).toHaveBeenCalledWith({
            provider: '',
            module: '',
            mode: 'data',
        });
    });

    it('should reset filters when reset button is clicked', () => {
        const onFiltersChange = vi.fn();
        const activeFilters = {
            provider: 'aws',
            module: 'module.storage',
            mode: 'managed',
        };

        render(
            <ControlPanel
                graph={mockGraph}
                filters={activeFilters}
                onFiltersChange={onFiltersChange}
            />
        );

        const resetButton = screen.getByText('Reset Filters');
        fireEvent.click(resetButton);

        expect(onFiltersChange).toHaveBeenCalledWith({
            provider: '',
            module: '',
            mode: '',
        });
    });

    it('should display legend', () => {
        const onFiltersChange = vi.fn();
        render(
            <ControlPanel
                graph={mockGraph}
                filters={defaultFilters}
                onFiltersChange={onFiltersChange}
            />
        );

        expect(screen.getByText('Legend')).toBeInTheDocument();
        expect(screen.getByText('AWS')).toBeInTheDocument();
        expect(screen.getByText('Azure')).toBeInTheDocument();
        expect(screen.getByText('Google Cloud')).toBeInTheDocument();
    });
});
